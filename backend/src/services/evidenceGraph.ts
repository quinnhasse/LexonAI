/**
 * Evidence Graph Builder
 * Constructs a graph showing the relationship between question, answer blocks, and sources
 * Designed for 3D visualization with answer at center
 */

import {
  AnswerPayload,
  EvidenceGraph,
  EvidenceNode,
  EvidenceEdge,
  Source,
  AnswerBlock
} from '../types/shared.js';
import { secondarySourceAgent, SecondarySourceNode } from './secondarySourceAgent.js';
import { semanticGraphBuilder, EmbeddableNode } from './semanticGraphBuilder.js';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel, logDensityConfig } from '../config/density.js';
import {
  generateQuestionLabel,
  generateSourceLabel,
  generateAnswerBlockLabels
} from '../utils/labelGenerator.js';

/**
 * Custom error for graph building failures
 */
export class GraphBuildError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GraphBuildError';
  }
}

/**
 * Builds a multi-layer evidence graph with answer at center
 *
 * Graph structure:
 * - Layer 0: Answer root node + question node
 * - Layer 1: Answer blocks (conceptual branches) radiating from center
 * - Layer 2: Direct sources at periphery
 * - Layer 3: Secondary sources (supporting concepts)
 *
 * Edges:
 * - Structural: "q" -> "answer" -> "ans-X" -> "sY" (high weights)
 * - Supporting: "sY" -> "sec-sY-Z" with relation "underpins"
 * - Semantic: weighted edges between related nodes
 *
 * This function orchestrates:
 * 1. Base tree structure (L0-L2)
 * 2. Secondary concept extraction (L3) - density-aware
 * 3. Semantic similarity edges - density-aware
 *
 * All enhancement steps (L3, semantic) use graceful degradation:
 * - If secondarySourceAgent fails, continue without L3
 * - If semanticGraphBuilder fails, continue without semantic edges
 * - Never throws errors from enhancement steps
 *
 * @param question - The original user question
 * @param answer - The structured answer with blocks
 * @param sources - The sources used in the answer
 * @param densityLevel - Graph density level (low/medium/high), defaults to medium
 * @returns EvidenceGraph with nodes, edges, and metadata
 * @throws GraphBuildError if validation fails
 */
export async function buildEvidenceGraph(
  question: string,
  answer: AnswerPayload,
  sources: Source[],
  densityLevel: DensityLevel = DEFAULT_DENSITY
): Promise<EvidenceGraph> {
  // Validation
  validateInputs(question, answer, sources);

  // Log density configuration
  const densityConfig = getDensityConfig(densityLevel);
  logDensityConfig(densityLevel, densityConfig);

  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];
  const edgeSet = new Set<string>(); // Track unique edges

  // 1. Create central answer root node
  nodes.push({
    id: 'answer',
    type: 'answer_root',
    label: truncateText(answer.text, 100),
    shortLabel: 'Answer',
    metadata: {
      fullText: answer.text,
      layer: 0
    }
  });

  // 2. Create question node (side connection)
  nodes.push({
    id: 'q',
    type: 'question',
    label: truncateText(question, 80),
    shortLabel: generateQuestionLabel(question),
    metadata: {
      fullText: question,
      layer: 0
    }
  });

  // 3. Edge: question → answer_root (high weight for structural edges)
  edges.push({
    from: 'q',
    to: 'answer',
    relation: 'answers',
    weight: 1.0
  });

  // 4. Generate short labels for all answer blocks (batched for efficiency)
  console.log('[EvidenceGraph] Step 1: Generating short labels for answer blocks...');
  let blockShortLabels: string[];
  try {
    blockShortLabels = await generateAnswerBlockLabels(answer.blocks.map(b => b.text));
    console.log(`[EvidenceGraph] Generated ${blockShortLabels.length} block labels`);
  } catch (error) {
    console.warn(`[EvidenceGraph] Failed to generate block labels, using fallbacks: ${error}`);
    blockShortLabels = answer.blocks.map((_, idx) => `Block ${idx + 1}`);
  }

  // 5. Create answer block nodes (Layer 1)
  for (let i = 0; i < answer.blocks.length; i++) {
    const block = answer.blocks[i];
    const shortLabel = blockShortLabels[i] || `Block ${i + 1}`;

    nodes.push({
      id: block.id,
      type: 'answer_block',
      label: truncateText(block.text, 100),
      shortLabel: shortLabel,
      metadata: {
        fullText: block.text,
        blockType: block.type,
        layer: 1,
        branchId: block.id, // Each block is its own branch
        primaryParentId: 'answer'
      }
    });

    // Edge: answer_root → block (high weight for structural edges)
    edges.push({
      from: 'answer',
      to: block.id,
      relation: 'answers',
      weight: 1.0
    });

    // Edges: block → sources (with deduplication)
    for (const sourceId of block.source_ids) {
      const edgeKey = `${block.id}->${sourceId}`;

      // Validate source exists
      if (!sources.find(s => s.id === sourceId)) {
        console.warn(
          `Source ${sourceId} referenced by block ${block.id} not found in sources array`
        );
        continue;
      }

      // Only add edge if not already present
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          from: block.id,
          to: sourceId,
          relation: 'supports',
          weight: 0.95 // High weight for citation edges
        });
      }
    }
  }

  // 6. Create direct source nodes (Layer 2)
  // Calculate citation counts and determine branch affiliations
  const citationCounts = new Map<string, number>();
  const sourceToBranches = new Map<string, Set<string>>();

  for (const block of answer.blocks) {
    for (const sourceId of block.source_ids) {
      citationCounts.set(sourceId, (citationCounts.get(sourceId) || 0) + 1);

      if (!sourceToBranches.has(sourceId)) {
        sourceToBranches.set(sourceId, new Set());
      }
      sourceToBranches.get(sourceId)!.add(block.id);
    }
  }

  console.log('[EvidenceGraph] Step 2: Creating source nodes with brand labels...');
  for (const source of sources) {
    const branches = sourceToBranches.get(source.id);
    const primaryBranch = branches && branches.size > 0
      ? Array.from(branches)[0]  // First block that cites this source
      : undefined;

    nodes.push({
      id: source.id,
      type: 'direct_source',
      label: truncateText(source.title, 60),
      shortLabel: generateSourceLabel(source.title, source.url),
      metadata: {
        fullText: source.snippet,
        full_text: source.full_text,
        url: source.url,
        score: source.score,
        layer: 2,
        citationCount: citationCounts.get(source.id) || 0,
        branchId: primaryBranch,
        primaryParentId: primaryBranch,
        ...source.metadata
      }
    });
  }

  // 7. Add Layer 3: Secondary sources (supporting concepts)
  let secondaryNodes: SecondarySourceNode[] = [];
  try {
    console.log('[EvidenceGraph] Step 3: Extracting secondary concepts (Layer 3)...');
    secondaryNodes = await secondarySourceAgent(question, answer, sources, densityLevel);

    for (const secNode of secondaryNodes) {
      // Add secondary source node
      // SecondarySourceAgent now returns short_label field
      nodes.push({
        id: secNode.id,
        type: 'secondary_source',
        label: secNode.title,
        shortLabel: secNode.short_label || secNode.title, // Use short_label from LLM
        metadata: {
          fullText: secNode.text,
          layer: 3,
          primaryParentId: secNode.parentSourceId,
          parentSourceId: secNode.parentSourceId,
          relatedBlockIds: secNode.relatedBlockIds,
          branchId: findBranchId(secNode.parentSourceId, nodes),
          importance: secNode.importance
        }
      });

      // Add structural edge: direct_source -> secondary_source
      edges.push({
        from: secNode.parentSourceId,
        to: secNode.id,
        relation: 'underpins',
        weight: 0.9
      });
    }

    console.log(`[EvidenceGraph] Added ${secondaryNodes.length} secondary concept nodes`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[EvidenceGraph] Secondary source extraction failed, continuing without L3: ${errorMsg}`);
  }

  // 7. Add semantic edges based on embeddings
  try {
    console.log('[EvidenceGraph] Step 4: Building semantic edges...');

    // Build list of embeddable nodes
    const embeddableNodes: EmbeddableNode[] = nodes
      .filter(node => node.type !== 'answer_root' && node.type !== 'question')
      .map(node => ({
        id: node.id,
        type: node.type,
        text: node.metadata?.fullText || node.label
      }));

    console.log(`[EvidenceGraph] Embeddable nodes: ${embeddableNodes.length}`);

    if (embeddableNodes.length >= 2) {
      const semanticEdges = await semanticGraphBuilder(embeddableNodes, {}, densityLevel);

      // Add semantic edges (avoid duplicates)
      for (const semEdge of semanticEdges) {
        // Check if edge already exists (in either direction)
        const existsForward = edges.some(e => e.from === semEdge.from && e.to === semEdge.to);
        const existsReverse = edges.some(e => e.from === semEdge.to && e.to === semEdge.from);

        if (!existsForward && !existsReverse) {
          edges.push({
            from: semEdge.from,
            to: semEdge.to,
            relation: 'semantic_related',
            weight: semEdge.similarity
          });
        }
      }

      console.log(`[EvidenceGraph] Added ${semanticEdges.length} semantic edges`);
    } else {
      console.log('[EvidenceGraph] Insufficient nodes for semantic edges, skipping');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[EvidenceGraph] Semantic graph building failed, continuing without semantic edges: ${errorMsg}`);
  }

  // 8. Count nodes by layer for metadata
  const nodeCounts = countNodesByLayer(nodes);

  // 9. Add graph-level metadata
  return {
    nodes,
    edges,
    metadata: {
      sourceCount: sources.length,
      blockCount: answer.blocks.length,
      createdAt: new Date(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByLayer: nodeCounts,
      secondarySourceCount: secondaryNodes.length
    }
  };
}

/**
 * Helper: Find the branchId for a given node
 */
function findBranchId(nodeId: string, nodes: EvidenceNode[]): string | undefined {
  const node = nodes.find(n => n.id === nodeId);
  return node?.metadata?.branchId;
}

/**
 * Helper: Count nodes by layer
 */
function countNodesByLayer(nodes: EvidenceNode[]): Record<number, number> {
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const node of nodes) {
    const layer = node.metadata?.layer;
    if (layer !== undefined && layer in counts) {
      counts[layer]++;
    }
  }

  return counts;
}

/**
 * Validates graph inputs
 * @throws GraphBuildError if validation fails
 */
function validateInputs(
  question: string,
  answer: AnswerPayload,
  sources: Source[]
): void {
  if (!question || question.trim().length === 0) {
    throw new GraphBuildError('Question cannot be empty');
  }

  if (!answer.text || answer.text.trim().length === 0) {
    throw new GraphBuildError('Answer text cannot be empty');
  }

  if (!answer.blocks || answer.blocks.length === 0) {
    throw new GraphBuildError('Answer must contain at least one block');
  }

  // Check for duplicate block IDs
  const blockIds = new Set<string>();
  for (const block of answer.blocks) {
    if (!block.id) {
      throw new GraphBuildError('All blocks must have an ID');
    }
    if (blockIds.has(block.id)) {
      throw new GraphBuildError(`Duplicate block ID: ${block.id}`, { id: block.id });
    }
    blockIds.add(block.id);
  }

  // Check for duplicate source IDs
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (!source.id) {
      throw new GraphBuildError('All sources must have an ID');
    }
    if (sourceIds.has(source.id)) {
      throw new GraphBuildError(`Duplicate source ID: ${source.id}`, { id: source.id });
    }
    sourceIds.add(source.id);
  }
}

/**
 * Truncates text with ellipsis at word boundary when possible
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';

  // Try to truncate at last space before maxLength
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    // Space found in reasonable position (last 30%)
    return truncated.substring(0, lastSpace) + '...';
  }

  // No good space, hard truncate
  return truncated + '...';
}

/**
 * Calculates edge strength based on citation frequency
 * Can be used to enhance edges with metadata
 *
 * @param sourceId - Source to calculate strength for
 * @param allBlocks - All answer blocks
 * @returns Normalized strength value (0-1)
 */
export function calculateEdgeStrength(
  sourceId: string,
  allBlocks: AnswerBlock[]
): number {
  const totalCitations = allBlocks.reduce(
    (sum, block) => sum + block.source_ids.filter(id => id === sourceId).length,
    0
  );

  // Find max citations for any source
  const citationCounts = new Map<string, number>();
  for (const block of allBlocks) {
    for (const id of block.source_ids) {
      citationCounts.set(id, (citationCounts.get(id) || 0) + 1);
    }
  }

  const maxCitations = Math.max(...Array.from(citationCounts.values()), 1);

  return totalCitations / maxCitations;
}
