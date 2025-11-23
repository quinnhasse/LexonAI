/**
 * Density Configuration for Evidence Graph
 * Controls the richness and complexity of the multi-layer graph
 *
 * This module provides configurable density levels that scale:
 * - Number of sources retrieved
 * - Direct sources per block
 * - Secondary concepts extracted
 * - Semantic edge density
 */

/**
 * Density level presets
 * - low: Minimal graph for simple questions, faster response
 * - medium: Balanced graph for most questions (DEFAULT)
 * - high: Rich graph for complex multi-part questions
 */
export type DensityLevel = 'low' | 'medium' | 'high';

/**
 * Configuration for graph density at each stage of the pipeline
 */
export interface DensityConfig {
  /** Number of sources to retrieve from Exa */
  exaNumResults: number;

  /** Target range for direct sources per answer block */
  directSourcesPerBlock: {
    min: number;
    target: number;
    max: number;
  };

  /** Secondary source extraction configuration */
  secondarySources: {
    /** Number of top sources to extract concepts from */
    topSourcesToProcess: number;
    /** Number of concepts to extract per source */
    conceptsPerSource: number;
    /** Global cap on total secondary nodes */
    maxTotalConcepts: number;
  };

  /** Semantic edge generation configuration */
  semanticEdges: {
    /** Minimum cosine similarity to create an edge */
    minSimilarity: number;
    /** Top K most similar neighbors per node */
    topK: number;
    /** Maximum total semantic edges */
    maxEdges: number;
  };
}

/**
 * Density configuration presets
 */
export const DENSITY_PRESETS: Record<DensityLevel, DensityConfig> = {
  low: {
    exaNumResults: 6,
    directSourcesPerBlock: {
      min: 1,
      target: 2,
      max: 4,
    },
    secondarySources: {
      topSourcesToProcess: 3,
      conceptsPerSource: 2,
      maxTotalConcepts: 15,
    },
    semanticEdges: {
      minSimilarity: 0.65,
      topK: 4,
      maxEdges: 40,
    },
  },

  medium: {
    exaNumResults: 10,
    directSourcesPerBlock: {
      min: 1,
      target: 4,
      max: 6,
    },
    secondarySources: {
      topSourcesToProcess: 5,
      conceptsPerSource: 3,
      maxTotalConcepts: 30,
    },
    semanticEdges: {
      minSimilarity: 0.60,
      topK: 6,
      maxEdges: 80,
    },
  },

  high: {
    exaNumResults: 12,
    directSourcesPerBlock: {
      min: 1,
      target: 5,
      max: 8,
    },
    secondarySources: {
      topSourcesToProcess: 8,
      conceptsPerSource: 4,
      maxTotalConcepts: 40,
    },
    semanticEdges: {
      minSimilarity: 0.55,
      topK: 8,
      maxEdges: 120,
    },
  },
};

/**
 * Default density level
 */
export const DEFAULT_DENSITY: DensityLevel = 'medium';

/**
 * Gets density configuration for a given level
 */
export function getDensityConfig(level: DensityLevel = DEFAULT_DENSITY): DensityConfig {
  return DENSITY_PRESETS[level];
}

/**
 * Determines appropriate density level based on question complexity
 * This is a simple heuristic - could be enhanced with ML in the future
 *
 * @param question - The user's question
 * @param answerBlockCount - Number of answer blocks generated (if available)
 * @returns Recommended density level
 */
export function inferDensityLevel(
  question: string,
  answerBlockCount?: number
): DensityLevel {
  // Simple heuristics:
  // 1. Question length
  // 2. Number of question marks (multiple questions)
  // 3. Presence of multi-part indicators
  // 4. Number of answer blocks (if available)

  const questionWords = question.trim().split(/\s+/).length;
  const questionMarks = (question.match(/\?/g) || []).length;
  const hasMultiPartIndicators = /\b(and|or|also|additionally|furthermore|moreover)\b/i.test(question);
  const hasListIndicators = /\b(list|enumerate|what are|types of|kinds of|examples of)\b/i.test(question);

  let score = 0;

  // Length scoring
  if (questionWords > 20) score += 2;
  else if (questionWords > 10) score += 1;

  // Multiple questions
  if (questionMarks > 1) score += 2;

  // Multi-part indicators
  if (hasMultiPartIndicators) score += 1;
  if (hasListIndicators) score += 1;

  // Answer block count (if available)
  if (answerBlockCount !== undefined) {
    if (answerBlockCount >= 6) score += 2;
    else if (answerBlockCount >= 4) score += 1;
  }

  // Determine level
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Logs density configuration for debugging
 */
export function logDensityConfig(level: DensityLevel, config: DensityConfig): void {
  console.log(`[DensityConfig] Using density level: ${level.toUpperCase()}`);
  console.log(`[DensityConfig]   - Exa results: ${config.exaNumResults}`);
  console.log(`[DensityConfig]   - Sources per block: ${config.directSourcesPerBlock.min}-${config.directSourcesPerBlock.max} (target: ${config.directSourcesPerBlock.target})`);
  console.log(`[DensityConfig]   - Secondary concepts: up to ${config.secondarySources.maxTotalConcepts} (${config.secondarySources.conceptsPerSource} per source)`);
  console.log(`[DensityConfig]   - Semantic edges: up to ${config.semanticEdges.maxEdges} (topK: ${config.semanticEdges.topK}, minSim: ${config.semanticEdges.minSimilarity})`);
}
