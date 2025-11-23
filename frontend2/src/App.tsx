import { useState } from 'react'
import QuestionInput from './components/QuestionInput'
import GraphVisualization from './components/GraphVisualization'
import NodeDetailPanel from './components/NodeDetailPanel'
import { ReasoningResponse, Node, Edge } from './types'
import { transformResponseToGraph } from './utils/graphTransform'
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
      // Call backend API
      const res = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })
      const data: ReasoningResponse = await res.json()
      console.log(data);

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
      console.error('Error fetching response:', error)
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
