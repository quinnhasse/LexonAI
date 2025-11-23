import { useState } from 'react'
import QuestionInput from './components/QuestionInput'
import GraphVisualization from './components/GraphVisualization'
import NodeDetailPanel from './components/NodeDetailPanel'
import { Node, Edge } from './types'
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

  const handleQuestionSubmit = async (question: string) => {
    setHasAskedQuestion(true)
    setIsLoading(true)
    setNodes([])
    setEdges([])
    setHighlightedNodes(new Set())

    try {
      // Call backend API using the API client
      const data = await askQuestion(question)
      console.log('API Response:', data)

      // Transform API response to graph data
      const graphData = transformResponseToGraph(data)
      setNodes(graphData.nodes)
      setEdges(graphData.edges)
      setIsLoading(false)

      // Highlight all nodes after a short delay
      setTimeout(() => {
        const allNodeIds = new Set(graphData.nodes.map(n => n.id))
        setHighlightedNodes(allNodeIds)
      }, 500)
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('API Error:', error.message, error.status, error.data)
      } else {
        console.error('Error fetching response:', error)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <GraphVisualization
        nodes={nodes}
        edges={edges}
        highlightedNodes={highlightedNodes}
        onNodeClick={setSelectedNode}
        onInteraction={() => setIsPromptDimmed(true)}
      />

      <QuestionInput
        onSubmit={handleQuestionSubmit}
        isLoading={isLoading}
        hasAskedQuestion={hasAskedQuestion}
        isDimmed={isPromptDimmed}
        onActivate={() => setIsPromptDimmed(false)}
      />

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

export default App
