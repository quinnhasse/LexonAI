/**
 * Secondary Source Agent - Layer 3 Concept Extraction
 * Extracts supporting concepts and underlying ideas from direct sources
 *
 * This module enhances the evidence graph by adding a third layer of nodes
 * representing key concepts that underpin the direct sources. These provide
 * additional context for the 3D knowledge ball visualization.
 */

import { Source, AnswerPayload } from '../types/shared.js';
import { config } from '../config/env.js';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel } from '../config/density.js';
import { Exa } from 'exa-js';

const exaClient = config.exaApiKey ? new Exa(config.exaApiKey) : null;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a secondary source/concept node extracted from a direct source
 */
export interface SecondarySourceNode {
  /** Unique ID (e.g., "sec-s1-1", "sec-s1-2") */
  id: string;

  /** Parent direct source ID (e.g., "s1") */
  parentSourceId: string;

  /** Related answer block IDs that cite the parent source */
  relatedBlockIds: string[];

  /** Short concept label (1-5 words) */
  title: string;

  /** Concept explanation (2-4 sentences) */
  text: string;

  /** 1-3 word tag for 3D visualization */
  short_label: string;

  /** Importance score (0-1), optional */
  importance?: number;
}

const BATCH_SECONDARY_SCHEMA = {
  type: 'object',
  required: ['sources'],
  properties: {
    sources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['source_id', 'concepts'],
        properties: {
          source_id: { type: 'string' },
          concepts: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'text', 'short_label'],
              properties: {
                title: { type: 'string' },
                text: { type: 'string' },
                short_label: { type: 'string' },
                importance: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};

const exaSystemPrompt = `You are an expert assistant that organizes source-based reasoning.
Extract 2-4 supporting concepts per source with short titles, explanatory text, and importance scores.`;

/**
 * Validates LLM response structure
 */
function validateConceptsResponse(response: unknown): { title: string; text: string; short_label: string; importance?: number }[] {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const payload = response as Record<string, unknown>;

  if (!Array.isArray(payload.concepts)) {
    throw new Error('Invalid response: concepts is not an array');
  }

  const concepts: { title: string; text: string; short_label: string; importance?: number }[] = [];

  for (let i = 0; i < payload.concepts.length; i++) {
    const concept = payload.concepts[i];

    if (!concept || typeof concept !== 'object') {
      console.warn(`[SecondarySourceAgent] Skipping invalid concept ${i}`);
      continue;
    }

    const c = concept as Record<string, unknown>;

    if (typeof c.title !== 'string' || typeof c.text !== 'string') {
      console.warn(`[SecondarySourceAgent] Skipping concept ${i} with invalid title/text`);
      continue;
    }

    const short_label = typeof c.short_label === 'string' ? c.short_label : c.title;
    const importance = typeof c.importance === 'number' ? c.importance : undefined;

    concepts.push({
      title: c.title,
      text: c.text,
      short_label,
      importance
    });
  }

  return concepts;
}

/**
 * Batch concept response entry
 */
interface BatchSourceConcept {
  source_id: string;
  concepts: Array<{
    title: string;
    text: string;
    short_label: string;
    importance?: number;
  }>;
}

/**
 * Validates the batched secondary concept response from Exa
 */
function validateBatchConceptsResponse(response: unknown): BatchSourceConcept[] {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid batch response: not an object');
  }

  const payload = response as Record<string, unknown>;
  if (!Array.isArray(payload.sources)) {
    throw new Error('Invalid batch response: sources is not an array');
  }

  const batch: BatchSourceConcept[] = [];

  for (const entry of payload.sources) {
    if (!entry || typeof entry !== 'object') continue;
    const sourceEntry = entry as Record<string, unknown>;
    const sourceId = typeof sourceEntry.source_id === 'string' ? sourceEntry.source_id : undefined;
    if (!sourceId) continue;
    const concepts = sourceEntry.concepts;
    if (!Array.isArray(concepts)) continue;

    const validatedConcepts = validateConceptsResponse({ concepts });
    if (validatedConcepts.length === 0) continue;

    batch.push({
      source_id: sourceId,
      concepts: validatedConcepts,
    });
  }

  return batch;
}

/**
 * Truncates a source text for the batch prompt
 */
function truncateSourceForBatch(source: Source, maxChars: number): string {
  const content = source.full_text || source.snippet || '';
  if (content.length <= maxChars) {
    return content;
  }
  const truncated = content.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxChars * 0.7) {
    return truncated.substring(0, lastPeriod + 1) + ' [...]';
  }
  return truncated + '...';
}

/**
 * Builds the batch prompt for secondary concept extraction
 */
function buildBatchSecondaryPrompt(
  question: string,
  sources: { source: Source; citationCount: number; relatedBlocks: string[] }[],
  conceptsPerSource: number
): string {
  const sourceDescriptions = sources.map((entry, idx) => {
    const source = entry.source;
    const snippet = truncateSourceForBatch(source, 1000);
    const blocks = entry.relatedBlocks.length > 0 ? entry.relatedBlocks.join(', ') : 'None';

    return `Source ${idx + 1}:
Source ID: ${source.id}
Title: ${source.title}
URL: ${source.url}
Snippet:
${snippet}
Citation count: ${entry.citationCount}
Cited by blocks: ${blocks}
`;
  });

  return `Question: ${question}

You are extracting ${conceptsPerSource} supporting concept(s) from each source above that help answer the question.

For each source, return 2-4 high-level supporting concepts that:
- reveal core ideas or terminology underpinning the source
- relate directly to the question
- include an importance score between 0 and 1

Return ONLY valid JSON matching this structure:
{
  "sources": [
    {
      "source_id": "s1",
      "concepts": [
        {
          "title": "Concept name",
          "text": "2-4 sentence explanation",
          "short_label": "tag (1-3 words)",
          "importance": 0.85
        }
      ]
    }
  ]
}

Maintain source order. Limit concepts to ${conceptsPerSource} per source and keep text concise.

Sources:
${sourceDescriptions.join('\n')}
`;
}

/**
 * Extracts secondary concepts via a single call to Exa's /answer endpoint
 */
async function extractSecondaryConceptsBatch(
  question: string,
  sources: { source: Source; citationCount: number; relatedBlocks: string[] }[],
  conceptsPerSource: number
): Promise<BatchSourceConcept[]> {
  if (!exaClient) {
    throw new Error('EXA_API_KEY not configured');
  }

  if (sources.length === 0) {
    return [];
  }

  const prompt = buildBatchSecondaryPrompt(question, sources, conceptsPerSource);

  const response = await exaClient.answer(prompt, {
    systemPrompt: exaSystemPrompt,
    outputSchema: BATCH_SECONDARY_SCHEMA,
    text: false
  });

  return validateBatchConceptsResponse(response.answer);
}

/**
 * Extracts secondary concepts from direct sources
 *
 * This function:
 * 1. Selects top-N sources by citation count (configurable via density)
 * 2. For each source, calls LLM to extract 2-4 supporting concepts
 * 3. Returns array of SecondarySourceNode objects
 *
 * Error handling:
 * - Returns empty array if LLM_API_KEY not configured
 * - Returns empty array if all extractions fail
 * - Continues on individual source failures (graceful degradation)
 *
 * @param question - The user's question
 * @param answer - The structured answer with blocks
 * @param sources - The direct sources used in the answer
 * @param densityLevel - Graph density level (low/medium/high), defaults to medium
 * @returns Array of secondary source nodes
 */
export async function secondarySourceAgent(
  question: string,
  answer: AnswerPayload,
  sources: Source[],
  densityLevel: DensityLevel = DEFAULT_DENSITY
): Promise<SecondarySourceNode[]> {
  console.log(`[SecondarySourceAgent] Extracting secondary concepts...`);

  // Get density configuration
  const densityConfig = getDensityConfig(densityLevel);
  const topSourcesToProcess = densityConfig.secondarySources.topSourcesToProcess;
  const conceptsPerSource = densityConfig.secondarySources.conceptsPerSource;
  const maxTotalConcepts = densityConfig.secondarySources.maxTotalConcepts;

  console.log(`[SecondarySourceAgent] Density: ${densityLevel} (top ${topSourcesToProcess} sources, ${conceptsPerSource} concepts/source, max ${maxTotalConcepts} total)`);

  // Check Exa API key
  if (!config.exaApiKey) {
    console.warn('[SecondarySourceAgent] EXA_API_KEY not configured, skipping secondary concepts');
    return [];
  }

  if (sources.length === 0) {
    console.log('[SecondarySourceAgent] No sources available, skipping');
    return [];
  }

  // Build map of source -> citing blocks
  const sourceToCitingBlocks = new Map<string, Set<string>>();
  for (const block of answer.blocks) {
    for (const sourceId of block.source_ids) {
      if (!sourceToCitingBlocks.has(sourceId)) {
        sourceToCitingBlocks.set(sourceId, new Set());
      }
      sourceToCitingBlocks.get(sourceId)!.add(block.id);
    }
  }

  // Sort sources by citation count (descending), then by score
  const sourcesWithCounts = sources.map(source => ({
    source,
    citationCount: sourceToCitingBlocks.get(source.id)?.size || 0
  })).sort((a, b) => {
    // First by citation count
    if (b.citationCount !== a.citationCount) {
      return b.citationCount - a.citationCount;
    }
    // Then by source score
    return (b.source.score || 0) - (a.source.score || 0);
  });

  // Process top N sources (configurable via density)
  const sourcesToProcess = sourcesWithCounts.slice(0, topSourcesToProcess);

  console.log(`[SecondarySourceAgent] Processing ${sourcesToProcess.length}/${sources.length} sources`);

  const secondaryNodes: SecondarySourceNode[] = [];
  let successCount = 0;
  let failureCount = 0;

  const sourcesWithContext = sourcesToProcess.map(({ source, citationCount }) => ({
    source,
    citationCount,
    relatedBlocks: Array.from(sourceToCitingBlocks.get(source.id) || []),
  }));

  let batchConcepts: BatchSourceConcept[] = [];

  try {
    console.log('[SecondarySourceAgent] Extracting concepts via batched prompt');
    batchConcepts = await extractSecondaryConceptsBatch(question, sourcesWithContext, conceptsPerSource);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[SecondarySourceAgent] Batched extraction failed: ${errorMsg}`);
  }

  const conceptMap = new Map(batchConcepts.map(entry => [entry.source_id, entry.concepts]));

  for (const { source, citationCount, relatedBlocks } of sourcesWithContext) {
    if (citationCount === 0) {
      continue;
    }

    const concepts = conceptMap.get(source.id) || [];
    if (concepts.length === 0) {
      failureCount++;
      continue;
    }

    successCount++;

    for (let index = 0; index < Math.min(conceptsPerSource, concepts.length); index++) {
      if (secondaryNodes.length >= maxTotalConcepts) {
        console.log(`[SecondarySourceAgent] Reached global cap of ${maxTotalConcepts} concepts, stopping extraction`);
        break;
      }

      const concept = concepts[index];
      secondaryNodes.push({
        id: `sec-${source.id}-${index + 1}`,
        parentSourceId: source.id,
        relatedBlockIds: relatedBlocks,
        title: concept.title,
        text: concept.text,
        short_label: concept.short_label,
        importance: concept.importance
      });
    }

    if (secondaryNodes.length >= maxTotalConcepts) {
      break;
    }
  }

  console.log(`[SecondarySourceAgent] Completed: ${successCount} successful, ${failureCount} failed`);
  console.log(`[SecondarySourceAgent] Total secondary concepts: ${secondaryNodes.length}`);

  return secondaryNodes;
}
