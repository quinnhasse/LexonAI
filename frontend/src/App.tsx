import { useState, useEffect, useRef } from 'react'
import QuestionInput from './components/QuestionInput'
import GraphVisualization from './components/GraphVisualization'
import Sidebar from './components/Sidebar'
import LandingPage from './components/LandingPage'
import BackgroundNetworkSphere from './components/BackgroundNetworkSphere'
import { ControlsPanel } from './components/controls/ControlsPanel'
import { LoadingOverlay } from './components/LoadingOverlay'
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

  // Loading overlay state
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Thinking...')
  const pollingIntervalRef = useRef<number | null>(null)
  const pollingFailureCountRef = useRef(0)
  const syntheticProgressIntervalRef = useRef<number | null>(null)

  // Handle ESC key to collapse sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNode && sidebarExpanded) {
        setSidebarExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, sidebarExpanded])

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node)
    setSidebarExpanded(true) // Auto-open sidebar when node is clicked
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
    pollingFailureCountRef.current = 0
  }

  // Start synthetic progress animation (fallback)
  const startSyntheticProgress = () => {
    const startTime = Date.now()
    const duration = 10000 // 10 seconds to reach 90%

    syntheticProgressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(90, (elapsed / duration) * 90)
      setLoadingProgress(progress)
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

          // After 3 failures, switch to synthetic progress
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
        pollingFailureCountRef.current = 0 // Reset failure count on success

        setLoadingProgress(data.progress)
        setLoadingStatus(data.status)
      } catch (error) {
        pollingFailureCountRef.current++

        // After 3 failures, switch to synthetic progress
        if (pollingFailureCountRef.current >= 3) {
          console.warn('Progress polling failed 3 times, switching to synthetic progress')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          startSyntheticProgress()
        }
      }
    }, 300) // Poll every 300ms
  }

  const handleQuestionSubmit = async (question: string) => {
    // Generate unique job ID for this request
    const jobId = uuidv4()

    setHasAskedQuestion(true)
    setIsLoading(true)
    setNodes([])
    setEdges([])
    setHighlightedNodes(new Set())
    setSelectedNode(null) // Clear previous selection
    setSidebarExpanded(false) // Collapse sidebar
    setShowControls(false) // Hide controls during loading

    // Reset progress state
    setLoadingProgress(0)
    setLoadingStatus('Starting...')
    cleanupPolling()

    // Start progress polling
    startProgressPolling(jobId)

    try {
      // Call backend API with jobId for progress tracking
      const data = await askQuestion(question, jobId)
      console.log('✅ API Response:', data)
      setIsDemoMode(false)

      // Set progress to 100%
      cleanupPolling()
      setLoadingProgress(100)
      setLoadingStatus('Ready')

      // Transform API response to graph data
      const graphData = transformResponseToGraph(data)
      setNodes(graphData.nodes)
      setEdges(graphData.edges)

      // Wait briefly to show 100% state, then hide overlay
      setTimeout(() => {
        setIsLoading(false)
      }, 400)

      // Find and auto-select the answer root node with animation
      const answerRootNode = graphData.nodes.find(n => n.type === 'answer_root')
      if (answerRootNode) {
        setSelectedNode(answerRootNode)
        setSidebarExpanded(false) // Start collapsed
        // Expand after a short delay to trigger transition animation
        setTimeout(() => {
          setSidebarExpanded(true)
        }, 100)
      }

      // Highlight all nodes after a short delay
      setTimeout(() => {
        const allNodeIds = new Set(graphData.nodes.map(n => n.id))
        setHighlightedNodes(allNodeIds)
      }, 500)

      // Show controls after nodes start animating
      setTimeout(() => {
        setShowControls(true)
      }, 800)
    } catch (error) {
      // Backend is unavailable or failed - fall back to demo data
      console.warn('⚠️ Backend unavailable, loading demo data...')
      console.warn('💡 This happens when:')
      console.warn('   - Backend server is not running')
      console.warn('   - Missing API keys (EXA_API_KEY or LLM_API_KEY)')
      console.warn('   - Network connectivity issues')

      if (error instanceof ApiError) {
        console.error('API Error Details:', error.message, error.status)
      }

      // Set progress to 100% and cleanup
      cleanupPolling()
      setLoadingProgress(100)
      setLoadingStatus('Ready')

      try {
        // Load the example response as fallback
        const exampleResponse = await fetch('/examples/example-response.json')
        if (!exampleResponse.ok) {
          throw new Error('Failed to load demo data')
        }

        const data: ReasoningResponse = await exampleResponse.json()
        console.log('📊 Loaded demo data successfully')
        setIsDemoMode(true)

        // Transform example data to graph
        const graphData = transformResponseToGraph(data)
        setNodes(graphData.nodes)
        setEdges(graphData.edges)

        // Wait briefly to show 100% state, then hide overlay
        setTimeout(() => {
          setIsLoading(false)
        }, 400)

        // Find and auto-select the answer root node with animation
        const answerRootNode = graphData.nodes.find(n => n.type === 'answer_root')
        if (answerRootNode) {
          setSelectedNode(answerRootNode)
          setSidebarExpanded(false) // Start collapsed
          // Expand after a short delay to trigger transition animation
          setTimeout(() => {
            setSidebarExpanded(true)
          }, 100)
        }

        // Highlight all nodes after a short delay
        setTimeout(() => {
          const allNodeIds = new Set(graphData.nodes.map(n => n.id))
          setHighlightedNodes(allNodeIds)
        }, 500)

        // Show controls after nodes start animating (fallback/demo mode)
        setTimeout(() => {
          setShowControls(true)
        }, 800)
      } catch (fallbackError) {
        console.error('❌ Failed to load demo data:', fallbackError)
        console.error('Make sure /public/examples/example-response.json exists')
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="app">
      {/* Loading overlay - appears during query processing */}
      <LoadingOverlay
        visible={isLoading}
        progress={loadingProgress}
        status={loadingStatus}
      />

      {/* Background sphere - always visible, subtle in background, slides away when question asked */}
      <BackgroundNetworkSphere hasAskedQuestion={hasAskedQuestion} />

      {/* Landing page - only visible before first question */}
      {!hasAskedQuestion && (
        <LandingPage
          onQuestionSubmit={handleQuestionSubmit}
          isLoading={isLoading}
          hasAskedQuestion={hasAskedQuestion}
        />
      )}

      {/* Graph visualization - appears after question is asked */}
      {hasAskedQuestion && (
        <GraphVisualization
          nodes={nodes}
          edges={edges}
          highlightedNodes={highlightedNodes}
          layoutMode={layoutMode}
          colorMode={colorMode}
          onNodeClick={handleNodeClick}
          onInteraction={() => setIsPromptDimmed(true)}
          isDemoMode={isDemoMode}
        />
      )}

      {/* Controls panel - appears after graph loads */}
      {showControls && (
        <ControlsPanel
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />
      )}

      {/* Question input - moves to top after first question */}
      {hasAskedQuestion && (
        <QuestionInput
          onSubmit={handleQuestionSubmit}
          isLoading={isLoading}
          hasAskedQuestion={hasAskedQuestion}
          isDimmed={isPromptDimmed}
          onActivate={() => setIsPromptDimmed(false)}
        />
      )}

      {/* Sidebar - appears when node is selected */}
      <Sidebar
        node={selectedNode}
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
    </div>
  )
}

export default App
