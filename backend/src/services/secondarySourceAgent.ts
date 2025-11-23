/**
 * Secondary Source Agent - Layer 3 Concept Extraction
 * Extracts supporting concepts and underlying ideas from direct sources
 *
 * This module enhances the evidence graph by adding a third layer of nodes
 * representing key concepts that underpin the direct sources. These provide
 * additional context for the 3D knowledge ball visualization.
 */

import { Source, AnswerPayload } from '../types/shared';
import { config } from '../config/env';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel } from '../config/density';
import OpenAI from 'openai';

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

  /** Importance score (0-1), optional */
  importance?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LLM_CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.2,
  MAX_SOURCE_CHARS: 800,
  RESPONSE_FORMAT: { type: "json_object" as const },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncates source content for LLM prompt
 */
function truncateSourceContent(source: Source, maxChars: number): string {
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
 * Builds the system message for concept extraction
 */
function buildSystemMessage(): string {
  return `You are an expert at analyzing sources and identifying core underlying concepts.

Your task is to extract 2-4 KEY SUPPORTING CONCEPTS from a given source that are relevant to the question.

WHAT TO EXTRACT:
- Core ideas or principles that the source relies on
- Key background concepts needed to understand the source
- Important related topics or domain knowledge
- Foundational facts or definitions mentioned in the source

WHAT NOT TO EXTRACT:
- Simple restatements of the source text
- Trivial details
- Concepts not related to the question

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "concepts": [
    {
      "title": "Short concept name (1-5 words)",
      "text": "2-4 sentence explanation of this concept and why it matters in the context of the question",
      "importance": 0.85
    }
  ]
}

IMPORTANCE SCORING:
- 0.9-1.0: Critical foundational concept
- 0.7-0.9: Important supporting concept
- 0.5-0.7: Relevant but less central concept

Return 2-4 concepts. Focus on quality over quantity, but capture the key ideas that underpin this source.`;
}

/**
 * Builds the user message for a specific source
 */
function buildUserMessage(
  question: string,
  source: Source,
  relatedBlocks: string[]
): string {
  const truncatedContent = truncateSourceContent(source, LLM_CONFIG.MAX_SOURCE_CHARS);

  return `Question: ${question}

Source Title: ${source.title}
Source URL: ${source.url}
Source Content:
${truncatedContent}

This source is cited by ${relatedBlocks.length} answer block(s) in the response.

Extract 2-4 key underlying concepts from this source that help answer the question.`;
}

/**
 * Validates LLM response structure
 */
function validateConceptsResponse(response: unknown): { title: string; text: string; importance?: number }[] {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const payload = response as Record<string, unknown>;

  if (!Array.isArray(payload.concepts)) {
    throw new Error('Invalid response: concepts is not an array');
  }

  const concepts: { title: string; text: string; importance?: number }[] = [];

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

    const importance = typeof c.importance === 'number' ? c.importance : undefined;

    concepts.push({
      title: c.title,
      text: c.text,
      importance
    });
  }

  return concepts;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

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

  // Check API key
  if (!config.llmApiKey) {
    console.warn('[SecondarySourceAgent] LLM_API_KEY not configured, skipping secondary concepts');
    return [];
  }

  if (sources.length === 0) {
    console.log('[SecondarySourceAgent] No sources available, skipping');
    return [];
  }

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: config.llmApiKey,
  });

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

  for (const { source, citationCount } of sourcesToProcess) {
    // Skip sources with no citations (shouldn't happen, but defensive)
    if (citationCount === 0) {
      continue;
    }

    const relatedBlocks = Array.from(sourceToCitingBlocks.get(source.id) || []);

    try {
      console.log(`[SecondarySourceAgent] Extracting concepts from source ${source.id} (${citationCount} citations)`);

      const systemMessage = buildSystemMessage();
      const userMessage = buildUserMessage(question, source, relatedBlocks);

      const completion = await client.chat.completions.create({
        model: LLM_CONFIG.MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: LLM_CONFIG.TEMPERATURE,
        max_tokens: LLM_CONFIG.MAX_TOKENS,
        response_format: LLM_CONFIG.RESPONSE_FORMAT,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('LLM returned empty response');
      }

      const parsedResponse = JSON.parse(content);
      const concepts = validateConceptsResponse(parsedResponse);

      // Limit to conceptsPerSource (configurable via density)
      const limitedConcepts = concepts.slice(0, conceptsPerSource);

      console.log(`[SecondarySourceAgent] Extracted ${limitedConcepts.length} concepts from ${source.id}`);

      // Convert to SecondarySourceNode
      limitedConcepts.forEach((concept, index) => {
        // Respect global cap
        if (secondaryNodes.length < maxTotalConcepts) {
          secondaryNodes.push({
            id: `sec-${source.id}-${index + 1}`,
            parentSourceId: source.id,
            relatedBlockIds: relatedBlocks,
            title: concept.title,
            text: concept.text,
            importance: concept.importance
          });
        }
      });

      successCount++;

      // Early exit if we hit the global cap
      if (secondaryNodes.length >= maxTotalConcepts) {
        console.log(`[SecondarySourceAgent] Reached global cap of ${maxTotalConcepts} concepts, stopping extraction`);
        break;
      }

    } catch (error) {
      failureCount++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[SecondarySourceAgent] Failed to extract concepts from ${source.id}: ${errorMsg}`);
      // Continue processing other sources
    }
  }

  console.log(`[SecondarySourceAgent] Completed: ${successCount} successful, ${failureCount} failed`);
  console.log(`[SecondarySourceAgent] Total secondary concepts: ${secondaryNodes.length}`);

  return secondaryNodes;
}
