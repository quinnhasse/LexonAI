import { ReasoningResponse, Node, Edge } from '../types';
import { toShortHeading } from './graphUtils';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Computes the display heading for a node based on its type and label.
 * - answer_root nodes get "Answer"
 * - Other nodes get the first 3 words of their label
 * - Fallback chain: label → metadata.fullText → node.id
 */
function computeDisplayHeading(node: Node): string {
  // Special case: answer_root always shows "Answer"
  if (node.type === 'answer_root') {
    return 'Answer';
  }

  // Use label if available
  if (node.label && node.label.trim() !== '') {
    return toShortHeading(node.label);
  }

  // Fallback to fullText if label is missing (for node types that have it)
  const fullText = (node.metadata as any).fullText;
  if (fullText && typeof fullText === 'string') {
    return toShortHeading(fullText);
  }

  // Final fallback to node ID
  return toShortHeading(node.id);
}

export function transformResponseToGraph(response: ReasoningResponse): GraphData {
  // The evidence_graph is already structured with nodes and edges
  const { nodes, edges } = response.evidence_graph;

  // Add displayHeading to each node
  const enhancedNodes = nodes.map(node => ({
    ...node,
    displayHeading: computeDisplayHeading(node),
  }));

  // Normalize edges to have both from/to and source/target for compatibility
  const normalizedEdges: Edge[] = edges.map(edge => ({
    ...edge,
    source: edge.from,
    target: edge.to,
  }));

  return {
    nodes: enhancedNodes,
    edges: normalizedEdges,
  };
}
