import { ReasoningResponse, Node, Edge } from '../types';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export function transformResponseToGraph(response: ReasoningResponse): GraphData {
  // The evidence_graph is already structured with nodes and edges
  const { nodes, edges } = response.evidence_graph;

  // Normalize edges to have both from/to and source/target for compatibility
  const normalizedEdges: Edge[] = edges.map(edge => ({
    ...edge,
    source: edge.from,
    target: edge.to,
  }));

  return {
    nodes,
    edges: normalizedEdges,
  };
}
