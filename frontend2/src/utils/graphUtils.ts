import { Edge, GraphNode, NodeType } from '../types'

/**
 * Converts a label string to a short heading (max 3 words).
 * Used for displaying concise node labels in the 3D graph.
 */
export function toShortHeading(label: string): string {
  if (!label || label.trim() === '') {
    return ''
  }
  const words = label.trim().split(/\s+/)
  return words.slice(0, 3).join(' ')
}

interface LeafOptions {
  allowedRelations?: Edge['relation'][]
}

export function findLeafNodes(
  nodes: GraphNode[],
  edges: Edge[],
  options: LeafOptions = {}
): GraphNode[] {
  const filteredEdges = options.allowedRelations
    ? edges.filter(e => options.allowedRelations!.includes(e.relation))
    : edges

  const nodesWithOutgoingEdges = new Set<string>()

  filteredEdges.forEach(edge => {
    const fromId = edge.from || edge.source
    if (fromId) {
      nodesWithOutgoingEdges.add(fromId)
    }
  })

  // Leaves are the outermost evidence nodes without outgoing edges (structural edges only)
  return nodes.filter(node =>
    (node.type === 'direct_source' || node.type === 'secondary_source') &&
    !nodesWithOutgoingEdges.has(node.id)
  )
}

interface PathOptions {
  allowedRelations?: Edge['relation'][]
  stopNodeTypes?: NodeType[]
}

/**
 * Calculates paths that climb inward from leaves by following incoming edges.
 * Each returned path is ordered from the leaf toward the core (edge list preserves original orientation).
 */
export function calculatePathsFromLeafNodes(
  leafNodes: GraphNode[],
  allEdges: Edge[],
  allNodes: GraphNode[],
  options: PathOptions = {}
): Edge[][] {
  const filteredEdges = options.allowedRelations
    ? allEdges.filter(e => options.allowedRelations!.includes(e.relation))
    : allEdges

  const incomingAdj: Map<string, Edge[]> = new Map()
  filteredEdges.forEach(edge => {
    const targetId = edge.to || edge.target
    if (!targetId) return
    if (!incomingAdj.has(targetId)) {
      incomingAdj.set(targetId, [])
    }
    incomingAdj.get(targetId)!.push(edge)
  })

  const nodeById = new Map<string, GraphNode>()
  allNodes.forEach(node => nodeById.set(node.id, node))

  const paths: Edge[][] = []

  const shouldStopAtNode = (nodeId: string) => {
    if (!options.stopNodeTypes || options.stopNodeTypes.length === 0) return false
    const node = nodeById.get(nodeId)
    return !!node && options.stopNodeTypes.includes(node.type)
  }

  function climb(currentNodeId: string, currentPath: Edge[]) {
    if (shouldStopAtNode(currentNodeId)) {
      if (currentPath.length > 0) {
        paths.push([...currentPath])
      }
      return
    }

    const incomingEdges = incomingAdj.get(currentNodeId)

    if (!incomingEdges || incomingEdges.length === 0) {
      if (currentPath.length > 0) {
        paths.push([...currentPath])
      }
      return
    }

    for (const edge of incomingEdges) {
      currentPath.push(edge)
      const parentId = edge.from || edge.source
      if (parentId) {
        climb(parentId, currentPath)
      }
      currentPath.pop()
    }
  }

  leafNodes.forEach(leafNode => {
    climb(leafNode.id, [])
  })

  return paths
}
