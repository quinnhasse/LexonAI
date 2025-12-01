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

  // Create a map of node types for edge analysis
  const nodeTypeMap = new Map<string, string>();
  enhancedNodes.forEach(node => {
    nodeTypeMap.set(node.id, node.type);
  });

  // Normalize edges and assign criticality
  const normalizedEdges: Edge[] = edges.map(edge => {
    const sourceType = nodeTypeMap.get(edge.from);
    const targetType = nodeTypeMap.get(edge.to);

    let criticality = 0.3; // Default weak
    let isCritical = false;

    // Critical Path Logic
    const isRootToAnswer = (sourceType === 'question' || sourceType === 'answer_root') && (targetType === 'answer_root' || targetType === 'answer_block');
    const isAnswerToSource = (sourceType === 'answer_block' || sourceType === 'answer_root') && targetType === 'direct_source';
    
    if (isRootToAnswer || isAnswerToSource) {
      criticality = 1.0;
      isCritical = true;
    }

    return {
      ...edge,
      source: edge.from,
      target: edge.to,
      criticality,
      isCritical
    };
  });

  return {
    nodes: enhancedNodes,
    edges: normalizedEdges,
  };
}
