/**
 * Expand Source Agent - Standalone Concept Extraction
 * Extracts secondary concepts from a single provided source
 *
 * This module provides a standalone endpoint for extracting supporting concepts
 * from an arbitrary web source without requiring the full /ask pipeline.
 */

import { config } from '../config/env';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel } from '../config/density';
import { Exa } from 'exa-js';

const exaClient = config.exaApiKey ? new Exa(config.exaApiKey) : null;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Simplified concept format for standalone extraction
 */
export interface ExpandedConcept {
  /** Concept name */
  title: string;

  /** 2-4 sentence explanation */
  text: string;

  /** 1-3 word tag for visualization */
  short_label: string;

  /** Importance score (0-1), optional */
  importance?: number;
}

/**
 * Input source for expansion
 */
export interface SourceInput {
  /** Source title */
  title: string;

  /** Source URL */
  url: string;

  /** Full text content of the source */
  content: string;
}

// ============================================================================
// SCHEMA & VALIDATION
// ============================================================================

const EXPAND_SCHEMA = {
  type: 'object',
  required: ['concepts'],
  properties: {
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
};

const exaSystemPrompt = `You are an expert assistant that identifies key supporting concepts and ideas from source material.
Extract 2-4 supporting concepts with short titles, explanatory text, and importance scores.`;

/**
 * Validates LLM response structure
 */
function validateConceptsResponse(response: unknown): ExpandedConcept[] {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const payload = response as Record<string, unknown>;

  if (!Array.isArray(payload.concepts)) {
    throw new Error('Invalid response: concepts is not an array');
  }

  const concepts: ExpandedConcept[] = [];

  for (let i = 0; i < payload.concepts.length; i++) {
    const concept = payload.concepts[i];

    if (!concept || typeof concept !== 'object') {
      console.warn(`[ExpandSourceAgent] Skipping invalid concept ${i}`);
      continue;
    }

    const c = concept as Record<string, unknown>;

    if (typeof c.title !== 'string' || typeof c.text !== 'string') {
      console.warn(`[ExpandSourceAgent] Skipping concept ${i} with invalid title/text`);
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

// ============================================================================
// PROMPT BUILDING
// ============================================================================

/**
 * Truncates source content for the prompt
 */
function truncateContent(content: string, maxChars: number): string {
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
 * Builds the prompt for concept extraction
 */
function buildExpandPrompt(source: SourceInput, conceptCount: number): string {
  const truncatedContent = truncateContent(source.content, 2000);

  return `Source Title: ${source.title}
Source URL: ${source.url}

Content:
${truncatedContent}

Extract ${conceptCount} supporting concepts from this source that:
- Reveal core ideas, terminology, or themes from the content
- Are distinct and non-overlapping
- Include an importance score between 0 and 1 (higher = more central to the source)

Return ONLY valid JSON matching this structure:
{
  "concepts": [
    {
      "title": "Concept name (1-5 words)",
      "text": "2-4 sentence explanation of this concept",
      "short_label": "tag (1-3 words for visualization)",
      "importance": 0.85
    }
  ]
}

Provide exactly ${conceptCount} concepts. Keep text concise and focused.`;
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

/**
 * Extracts secondary concepts from a single source
 *
 * This function:
 * 1. Takes a source with title, URL, and content
 * 2. Uses Exa's answer API to extract supporting concepts
 * 3. Returns simplified concept array
 *
 * Error handling:
 * - Throws if EXA_API_KEY not configured
 * - Throws if extraction fails
 * - Returns partial results if some concepts are invalid
 *
 * @param source - The source to expand (title, url, content)
 * @param densityLevel - Density level (low/medium/high), defaults to medium
 * @returns Array of expanded concepts
 */
export async function expandSourceAgent(
  source: SourceInput,
  densityLevel: DensityLevel = DEFAULT_DENSITY
): Promise<ExpandedConcept[]> {
  console.log(`[ExpandSourceAgent] Expanding source: ${source.title}`);
  console.log(`[ExpandSourceAgent] Density level: ${densityLevel}`);

  // Check Exa API key
  if (!config.exaApiKey) {
    throw new Error('EXA_API_KEY not configured');
  }

  if (!exaClient) {
    throw new Error('Exa client not initialized');
  }

  // Validate input
  if (!source.title || !source.url || !source.content) {
    throw new Error('Source must have title, url, and content');
  }

  // Get density configuration
  const densityConfig = getDensityConfig(densityLevel);
  const conceptCount = densityConfig.secondarySources.conceptsPerSource;

  console.log(`[ExpandSourceAgent] Extracting ${conceptCount} concepts`);

  // Build prompt
  const prompt = buildExpandPrompt(source, conceptCount);

  // Call Exa API
  try {
    const response = await exaClient.answer(prompt, {
      systemPrompt: exaSystemPrompt,
      outputSchema: EXPAND_SCHEMA,
      text: false
    });

    // Validate and return concepts
    const concepts = validateConceptsResponse(response.answer);

    console.log(`[ExpandSourceAgent] Successfully extracted ${concepts.length} concepts`);

    return concepts;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ExpandSourceAgent] Extraction failed: ${errorMsg}`);
    throw new Error(`Failed to extract concepts: ${errorMsg}`);
  }
}
