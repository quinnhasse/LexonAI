/**
 * Evidence Graph Builder
 * Constructs a graph showing the relationship between question, answer blocks, and sources
 */

import {
  AnswerPayload,
  EvidenceGraph,
  EvidenceNode,
  EvidenceEdge,
  Source
} from '../types/shared';

/**
 * Builds an evidence graph connecting the question to answer blocks to sources
 *
 * Graph structure:
 * - Question node (id: "q")
 * - Answer block nodes (id: "ans-1", "ans-2", ...)
 * - Source nodes (id: "s1", "s2", ...)
 *
 * Edges:
 * - "q" -> "ans-X" with relation "answers" (question answered by blocks)
 * - "ans-X" -> "sY" with relation "supports" (sources supporting answer blocks)
 *
 * @param question - The original user question
 * @param answer - The structured answer with blocks
 * @param sources - The sources used in the answer
 * @returns EvidenceGraph with nodes and edges
 */
export function buildEvidenceGraph(
  question: string,
  answer: AnswerPayload,
  sources: Source[]
): EvidenceGraph {
  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];

  // Add question node
  nodes.push({
    id: 'q',
    type: 'question',
    label: question
  });

  // Add answer block nodes and edges from question to blocks
  for (const block of answer.blocks) {
    nodes.push({
      id: block.id,
      type: 'answer_block',
      label: block.text.length > 100
        ? block.text.substring(0, 97) + '...'
        : block.text
    });

    // Edge from question to this answer block
    edges.push({
      from: 'q',
      to: block.id,
      relation: 'answers'
    });

    // Edges from this answer block to its supporting sources
    for (const sourceId of block.source_ids) {
      edges.push({
        from: block.id,
        to: sourceId,
        relation: 'supports'
      });
    }
  }

  // Add source nodes
  for (const source of sources) {
    nodes.push({
      id: source.id,
      type: 'source',
      label: source.title
    });
  }

  return {
    nodes,
    edges
  };
}
