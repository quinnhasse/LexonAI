import { useState, useEffect, useRef } from 'react'
import QuestionInput from './components/QuestionInput'
import GraphVisualization from './components/GraphVisualization'
import KnowledgeDeck from './components/KnowledgeDeck'
import Sidebar from './components/Sidebar'
import LandingPage from './components/LandingPage'
import BackgroundNetworkSphere from './components/BackgroundNetworkSphere'
import { LayoutControls } from './components/controls/LayoutControls'
import { LoadingOverlay } from './components/LoadingOverlay'
import ColorLegend from './components/ColorLegend'
import { Node, Edge, ReasoningResponse, LayoutMode, ColorMode } from './types'
import { transformResponseToGraph } from './utils/graphTransform'
import { askQuestion, ApiError } from './services/api'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

function App() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false)
  const [isPromptDimmed, setIsPromptDimmed] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('cluster')
  const [colorMode, setColorMode] = useState<ColorMode>('byLevel')
  const [showControls, setShowControls] = useState(false)

  // Spotlight State
  const [lockedSpotlight, setLockedSpotlight] = useState<string | null>(null)
  const [hoveredSpotlight, setHoveredSpotlight] = useState<string | null>(null)
  const activeSpotlight = hoveredSpotlight || lockedSpotlight

  const handleHoverType = (type: string | null) => setHoveredSpotlight(type)
  const handleToggleType = (type: string) => {
    setLockedSpotlight(prev => prev === type ? null : type)
  }

  // Loading overlay state
  const [backendProgress, setBackendProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Thinking...')
  const pollingIntervalRef = useRef<number | null>(null)
  const pollingFailureCountRef = useRef(0)
  const syntheticProgressIntervalRef = useRef<number | null>(null)
  const smoothProgressIntervalRef = useRef<number | null>(null)

  // Handle ESC key to collapse sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNode && sidebarExpanded) {
          setSidebarExpanded(false)
        }
        // Clear spotlight on escape if locked
        if (lockedSpotlight) {
          setLockedSpotlight(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, sidebarExpanded, lockedSpotlight])

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node)
    setSidebarExpanded(true) 
  }

  // Clean up polling intervals
  const cleanupPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (syntheticProgressIntervalRef.current) {
      clearInterval(syntheticProgressIntervalRef.current)
      syntheticProgressIntervalRef.current = null
    }
    if (smoothProgressIntervalRef.current) {
      clearInterval(smoothProgressIntervalRef.current)
      smoothProgressIntervalRef.current = null
    }
    pollingFailureCountRef.current = 0
  }

  // Start smooth progress animation that interpolates between backend values
  const startSmoothProgress = () => {
    smoothProgressIntervalRef.current = window.setInterval(() => {
      setDisplayProgress((currentDisplay) => {
        setBackendProgress((currentBackend) => {
          const targetProgress = currentBackend >= 100
            ? 100
            : Math.min(currentBackend + 5, 95)

          if (currentDisplay >= targetProgress) {
            return currentBackend 
          }

          const distance = targetProgress - currentDisplay
          const increment = distance > 20 ? 0.8 : distance > 10 ? 0.5 : 0.3
          const newDisplay = Math.min(currentDisplay + increment, targetProgress)

          setTimeout(() => setDisplayProgress(newDisplay), 0)

          return currentBackend
        })

        return currentDisplay 
      })
    }, 50) 
  }

  // Start synthetic progress animation (fallback)
  const startSyntheticProgress = () => {
    const startTime = Date.now()
    const duration = 10000 

    syntheticProgressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(90, (elapsed / duration) * 90)
      setBackendProgress(progress) 
    }, 100)
  }

  // Poll backend for progress updates
  const startProgressPolling = (jobId: string) => {
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000'

    pollingIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/progress/${jobId}`)

        if (!response.ok) {
          pollingFailureCountRef.current++
          if (pollingFailureCountRef.current >= 3) {
            console.warn('Progress polling failed 3 times, switching to synthetic progress')
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            startSyntheticProgress()
          }
          return
        }

        const data = await response.json()
        pollingFailureCountRef.current = 0 

        setBackendProgress(data.progress) 
        setLoadingStatus(data.status)
      } catch (error) {
        pollingFailureCountRef.current++
        if (pollingFailureCountRef.current >= 3) {
          console.warn('Progress polling failed 3 times, switching to synthetic progress')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          startSyntheticProgress()
        }
      }
    }, 300) 
  }

  const handleQuestionSubmit = async (question: string) => {
    const jobId = uuidv4()

    setHasAskedQuestion(true)
    setIsLoading(true)
    setNodes([])
    setEdges([])
    setHighlightedNodes(new Set())
    setSelectedNode(null) 
    setSidebarExpanded(false) 
    setShowControls(false) 

    setBackendProgress(0)
    setDisplayProgress(0)
    setLoadingStatus('Starting...')
    cleanupPolling()

    startSmoothProgress()
    startProgressPolling(jobId)

    try {
      const data = await askQuestion(question, jobId)
      console.log('✅ API Response:', data)
      setIsDemoMode(false)

      setBackendProgress(100)
      setDisplayProgress(100) 
      setLoadingStatus('Ready')
      cleanupPolling()

      setTimeout(() => {
        setIsLoading(false)
      }, 150)

      const graphData = transformResponseToGraph(data)
      setNodes(graphData.nodes)
      setEdges(graphData.edges)

      const answerRootNode = graphData.nodes.find(n => n.type === 'answer_root')
      if (answerRootNode) {
        setSelectedNode(answerRootNode)
        setSidebarExpanded(false) 
        setTimeout(() => {
          setSidebarExpanded(true)
        }, 100)
      }

      setTimeout(() => {
        const allNodeIds = new Set(graphData.nodes.map(n => n.id))
        setHighlightedNodes(allNodeIds)
      }, 500)

      setTimeout(() => {
        setShowControls(true)
      }, 800)
    } catch (error) {
      console.warn('⚠️ Backend unavailable, loading demo data...')
      
      if (error instanceof ApiError) {
        console.error('API Error Details:', error.message, error.status)
      }

      setBackendProgress(100)
      setDisplayProgress(100)
      setLoadingStatus('Ready')
      cleanupPolling()

      try {
        const exampleResponse = await fetch('/examples/example-response.json')
        if (!exampleResponse.ok) {
          throw new Error('Failed to load demo data')
        }

        const data: ReasoningResponse = await exampleResponse.json()
        console.log('📊 Loaded demo data successfully')
        setIsDemoMode(true)

        const graphData = transformResponseToGraph(data)
        setNodes(graphData.nodes)
        setEdges(graphData.edges)

        setTimeout(() => {
          setIsLoading(false)
        }, 150)

        const answerRootNode = graphData.nodes.find(n => n.type === 'answer_root')
        if (answerRootNode) {
          setSelectedNode(answerRootNode)
          setSidebarExpanded(false) 
          setTimeout(() => {
            setSidebarExpanded(true)
          }, 100)
        }

        setTimeout(() => {
          const allNodeIds = new Set(graphData.nodes.map(n => n.id))
          setHighlightedNodes(allNodeIds)
        }, 500)

        setTimeout(() => {
          setShowControls(true)
        }, 800)
      } catch (fallbackError) {
        console.error('❌ Failed to load demo data:', fallbackError)
        setIsLoading(false)
      }
    }
  }

  const handleAddNodesAndEdges = (newNodes: Node[], newEdges: Edge[]) => {
    setNodes(prevNodes => [...prevNodes, ...newNodes])
    setEdges(prevEdges => [...prevEdges, ...newEdges])
  }

  return (
    <div className="app">
      <LoadingOverlay
        visible={isLoading}
        progress={displayProgress}
        status={loadingStatus}
      />

      <BackgroundNetworkSphere hasAskedQuestion={hasAskedQuestion} />

      {!hasAskedQuestion && (
        <LandingPage
          onQuestionSubmit={handleQuestionSubmit}
          isLoading={isLoading}
          hasAskedQuestion={hasAskedQuestion}
        />
      )}

      {hasAskedQuestion && layoutMode !== 'deck' && (
        <GraphVisualization
          nodes={nodes}
          edges={edges}
          highlightedNodes={highlightedNodes}
          layoutMode={layoutMode}
          colorMode={colorMode}
          onNodeClick={handleNodeClick}
          onInteraction={() => setIsPromptDimmed(true)}
          isDemoMode={isDemoMode}
          activeSpotlight={activeSpotlight}
        />
      )}

      {hasAskedQuestion && layoutMode === 'deck' && (
        <KnowledgeDeck
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          highlightedNodes={highlightedNodes}
          activeSpotlight={activeSpotlight}
        />
      )}

      {showControls && (
        <LayoutControls 
          mode={layoutMode} 
          onChange={setLayoutMode}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />
      )}

      {showControls && (
        <ColorLegend 
          colorMode={colorMode} 
          onHoverType={handleHoverType}
          onToggleType={handleToggleType}
          activeSpotlight={activeSpotlight}
        />
      )}

      {hasAskedQuestion && (
        <QuestionInput
          onSubmit={handleQuestionSubmit}
          isLoading={isLoading}
          hasAskedQuestion={hasAskedQuestion}
          isDimmed={isPromptDimmed}
          onActivate={() => setIsPromptDimmed(false)}
        />
      )}

      <Sidebar
        node={selectedNode}
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onAddNodesAndEdges={handleAddNodesAndEdges}
        edges={edges}
      />
    </div>
  )
}

export default App
