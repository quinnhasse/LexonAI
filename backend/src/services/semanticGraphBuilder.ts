/**
 * Semantic Graph Builder - Weighted Edge Generation
 * Computes semantic similarity between nodes and creates weighted edges
 *
 * This module uses OpenAI embeddings to calculate relatedness between
 * answer blocks, direct sources, and secondary sources, producing weighted
 * edges for the 3D visualization.
 */

import { EvidenceNodeType } from '../types/shared';
import { config } from '../config/env';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel } from '../config/density';
import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a node that can be embedded for similarity computation
 */
export interface EmbeddableNode {
  /** Unique node ID */
  id: string;

  /** Node type */
  type: EvidenceNodeType;

  /** Text content to embed */
  text: string;
}

/**
 * Represents a weighted semantic edge between two nodes
 */
export interface SemanticEdgeSpec {
  /** Source node ID */
  from: string;

  /** Target node ID */
  to: string;

  /** Cosine similarity (0-1) */
  similarity: number;
}

/**
 * Configuration options for semantic graph building
 * If not provided, values are taken from density configuration
 */
export interface SemanticGraphOptions {
  /** Number of top neighbors to keep per node */
  topK?: number;

  /** Minimum similarity threshold to create an edge */
  minSimilarity?: number;

  /** Maximum total edges to return */
  maxEdges?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMBEDDING_CONFIG = {
  MODEL: 'text-embedding-3-small',  // Cheap, fast, good quality
  MAX_INPUT_CHARS: 200,             // Truncate long texts
  BATCH_SIZE: 100,                  // OpenAI allows up to 2048 per batch
} as const;

/**
 * Allowed node type pairs for semantic edges
 * We don't create semantic edges for certain type combinations
 */
const ALLOWED_TYPE_PAIRS = new Set([
  'answer_block:answer_block',
  'answer_block:direct_source',
  'direct_source:answer_block',
  'direct_source:direct_source',
  'direct_source:secondary_source',
  'secondary_source:direct_source',
  'secondary_source:secondary_source',
]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncates text for embedding
 */
function truncateForEmbedding(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxChars * 0.8) {
    return truncated.substring(0, lastSpace);
  }

  return truncated;
}

/**
 * Normalizes node type to canonical form
 * Maps "source" to "direct_source" for consistency
 */
function normalizeNodeType(type: EvidenceNodeType): string {
  if (type === 'source') {
    return 'direct_source';
  }
  return type;
}

/**
 * Checks if two node types should have semantic edges
 */
function shouldConnectTypes(type1: EvidenceNodeType, type2: EvidenceNodeType): boolean {
  const norm1 = normalizeNodeType(type1);
  const norm2 = normalizeNodeType(type2);

  // Don't connect answer_root or question nodes semantically
  if (norm1 === 'answer_root' || norm1 === 'question' ||
      norm2 === 'answer_root' || norm2 === 'question') {
    return false;
  }

  const pairKey = `${norm1}:${norm2}`;
  return ALLOWED_TYPE_PAIRS.has(pairKey);
}

/**
 * Computes cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Batches an array into chunks
 */
function batch<T>(array: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Builds semantic edges between nodes using embeddings
 *
 * This function:
 * 1. Embeds all node texts using OpenAI embeddings API
 * 2. Computes pairwise cosine similarities
 * 3. For each node, keeps top-K most similar neighbors above threshold
 * 4. Filters by allowed type pairs and deduplicates
 * 5. Returns sorted edges (highest similarity first)
 *
 * Performance considerations:
 * - Batches embedding requests
 * - Only computes similarities for allowed type pairs
 * - Applies top-K and threshold filtering per node
 * - Caps total edges returned
 *
 * Error handling:
 * - Returns empty array if LLM_API_KEY not configured
 * - Returns empty array if embedding fails
 * - Never throws errors
 *
 * @param nodes - Array of nodes to embed and connect
 * @param options - Configuration options (if not provided, uses density config)
 * @param densityLevel - Graph density level (low/medium/high), defaults to medium
 * @returns Array of weighted semantic edges
 */
export async function semanticGraphBuilder(
  nodes: EmbeddableNode[],
  options: SemanticGraphOptions = {},
  densityLevel: DensityLevel = DEFAULT_DENSITY
): Promise<SemanticEdgeSpec[]> {
  // Get density configuration and merge with explicit options
  const densityConfig = getDensityConfig(densityLevel);
  const {
    topK = options.topK ?? densityConfig.semanticEdges.topK,
    minSimilarity = options.minSimilarity ?? densityConfig.semanticEdges.minSimilarity,
    maxEdges = options.maxEdges ?? densityConfig.semanticEdges.maxEdges,
  } = options;

  console.log(`[SemanticGraphBuilder] Building semantic edges for ${nodes.length} nodes`);
  console.log(`[SemanticGraphBuilder] Density: ${densityLevel} (topK=${topK}, minSim=${minSimilarity}, maxEdges=${maxEdges})`);

  // Check API key
  if (!config.llmApiKey) {
    console.warn('[SemanticGraphBuilder] LLM_API_KEY not configured, skipping semantic edges');
    return [];
  }

  if (nodes.length < 2) {
    console.log('[SemanticGraphBuilder] Insufficient nodes for semantic edges');
    return [];
  }

  // Filter out nodes we don't want to embed
  const embeddableNodes = nodes.filter(node => {
    const norm = normalizeNodeType(node.type);
    return norm !== 'answer_root' && norm !== 'question';
  });

  if (embeddableNodes.length < 2) {
    console.log('[SemanticGraphBuilder] Insufficient embeddable nodes after filtering');
    return [];
  }

  console.log(`[SemanticGraphBuilder] Embedding ${embeddableNodes.length} nodes (filtered from ${nodes.length})`);

  try {
    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: config.llmApiKey,
    });

    // Prepare texts for embedding
    const textsToEmbed = embeddableNodes.map(node =>
      truncateForEmbedding(node.text, EMBEDDING_CONFIG.MAX_INPUT_CHARS)
    );

    // Batch embed
    const batches = batch(textsToEmbed, EMBEDDING_CONFIG.BATCH_SIZE);
    const allEmbeddings: number[][] = [];

    console.log(`[SemanticGraphBuilder] Embedding in ${batches.length} batch(es)`);

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batchTexts = batches[batchIdx];

      console.log(`[SemanticGraphBuilder] Embedding batch ${batchIdx + 1}/${batches.length} (${batchTexts.length} texts)`);

      const response = await client.embeddings.create({
        model: EMBEDDING_CONFIG.MODEL,
        input: batchTexts,
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...batchEmbeddings);

      console.log(`[SemanticGraphBuilder] Batch ${batchIdx + 1} complete, got ${batchEmbeddings.length} embeddings`);
    }

    if (allEmbeddings.length !== embeddableNodes.length) {
      throw new Error(`Embedding count mismatch: got ${allEmbeddings.length}, expected ${embeddableNodes.length}`);
    }

    console.log(`[SemanticGraphBuilder] All embeddings retrieved (${allEmbeddings.length} total)`);

    // Build node ID -> embedding map
    const nodeEmbeddings = new Map<string, number[]>();
    embeddableNodes.forEach((node, idx) => {
      nodeEmbeddings.set(node.id, allEmbeddings[idx]);
    });

    // Compute similarities and build edges
    const edgeCandidates: SemanticEdgeSpec[] = [];

    console.log(`[SemanticGraphBuilder] Computing similarities...`);

    // For each node, find top-K neighbors
    for (let i = 0; i < embeddableNodes.length; i++) {
      const nodeA = embeddableNodes[i];
      const embeddingA = allEmbeddings[i];
      const neighbors: { id: string; similarity: number }[] = [];

      for (let j = 0; j < embeddableNodes.length; j++) {
        if (i === j) continue;

        const nodeB = embeddableNodes[j];

        // Check if this type pair should be connected
        if (!shouldConnectTypes(nodeA.type, nodeB.type)) {
          continue;
        }

        const embeddingB = allEmbeddings[j];
        const similarity = cosineSimilarity(embeddingA, embeddingB);

        if (similarity >= minSimilarity) {
          neighbors.push({ id: nodeB.id, similarity });
        }
      }

      // Sort by similarity descending and take top-K
      neighbors.sort((a, b) => b.similarity - a.similarity);
      const topNeighbors = neighbors.slice(0, topK);

      // Add edges
      for (const neighbor of topNeighbors) {
        edgeCandidates.push({
          from: nodeA.id,
          to: neighbor.id,
          similarity: neighbor.similarity,
        });
      }
    }

    console.log(`[SemanticGraphBuilder] Generated ${edgeCandidates.length} edge candidates`);

    // Deduplicate edges (undirected: keep only one direction)
    // For each pair (a, b), only keep edge a->b if a < b lexicographically
    const edgeSet = new Set<string>();
    const uniqueEdges: SemanticEdgeSpec[] = [];

    for (const edge of edgeCandidates) {
      const [from, to] = edge.from < edge.to ? [edge.from, edge.to] : [edge.to, edge.from];
      const edgeKey = `${from}->${to}`;

      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        uniqueEdges.push({ from, to, similarity: edge.similarity });
      }
    }

    console.log(`[SemanticGraphBuilder] After deduplication: ${uniqueEdges.length} unique edges`);

    // Sort by similarity descending and cap
    uniqueEdges.sort((a, b) => b.similarity - a.similarity);
    const finalEdges = uniqueEdges.slice(0, maxEdges);

    console.log(`[SemanticGraphBuilder] Final edges: ${finalEdges.length} (capped at ${maxEdges})`);

    // Log summary stats
    if (finalEdges.length > 0) {
      const avgSimilarity = finalEdges.reduce((sum, e) => sum + e.similarity, 0) / finalEdges.length;
      const maxSim = finalEdges[0].similarity;
      const minSim = finalEdges[finalEdges.length - 1].similarity;

      console.log(`[SemanticGraphBuilder] Similarity stats: min=${minSim.toFixed(3)}, max=${maxSim.toFixed(3)}, avg=${avgSimilarity.toFixed(3)}`);
    }

    return finalEdges;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SemanticGraphBuilder] Failed to build semantic edges: ${errorMsg}`);
    return [];
  }
}
