import { useState, useEffect } from 'react'
import QuestionInput from './components/QuestionInput'
import GraphVisualization from './components/GraphVisualization'
import Sidebar from './components/Sidebar'
import { ControlsPanel } from './components/controls/ControlsPanel'
import { Node, Edge, ReasoningResponse, LayoutMode, ColorMode } from './types'
import { transformResponseToGraph } from './utils/graphTransform'
import { askQuestion, ApiError } from './services/api'
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

  const handleQuestionSubmit = async (question: string) => {
    setHasAskedQuestion(true)
    setIsLoading(true)
    setNodes([])
    setEdges([])
    setHighlightedNodes(new Set())
    setSelectedNode(null) // Clear previous selection

    try {
      // Call backend API using the API client
      const data = await askQuestion(question)
      console.log('✅ API Response:', data)
      setIsDemoMode(false)

      // Transform API response to graph data
      const graphData = transformResponseToGraph(data)
      setNodes(graphData.nodes)
      setEdges(graphData.edges)
      setIsLoading(false)

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
        setIsLoading(false)

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
      } catch (fallbackError) {
        console.error('❌ Failed to load demo data:', fallbackError)
        console.error('Make sure /public/examples/example-response.json exists')
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="app">
      {isDemoMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 193, 7, 0.9)',
          color: '#000',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 10000,
          backdropFilter: 'blur(10px)',
        }}>
          ⚠️ Demo Mode: Showing sample data (backend unavailable)
        </div>
      )}

      <GraphVisualization
        nodes={nodes}
        edges={edges}
        highlightedNodes={highlightedNodes}
        layoutMode={layoutMode}
        colorMode={colorMode}
        onNodeClick={handleNodeClick}
        onInteraction={() => setIsPromptDimmed(true)}
      />

      <ControlsPanel
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
      />

      <QuestionInput
        onSubmit={handleQuestionSubmit}
        isLoading={isLoading}
        hasAskedQuestion={hasAskedQuestion}
        isDimmed={isPromptDimmed}
        onActivate={() => setIsPromptDimmed(false)}
      />

      <Sidebar
        node={selectedNode}
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
    </div>
  )
}

export default App
