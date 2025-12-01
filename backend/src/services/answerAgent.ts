/**
 * Answer Agent - LLM-based answer generation with source grounding
 * Generates structured answers using OpenAI with strict source attribution
 *
 * This module implements the core "transparent AI" logic:
 * - Uses ONLY provided sources (no hallucination)
 * - Returns structured answer blocks with explicit source citations
 * - Validates all source_ids reference actual sources
 * - Falls back gracefully on errors to ensure system reliability
 */

import { Source, AnswerPayload, AnswerBlock } from '../types/shared';
import { config } from '../config/env';
import OpenAI from 'openai';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Configuration constants for LLM interaction
 * These control token limits, retry behavior, and model selection
 */
const LLM_CONFIG = {
  MODEL: config.llmModel,                 // Allows overriding to faster models (default: gpt-3.5-turbo)
  MAX_TOKENS: 3000,                      // Output limit for answer generation
  TEMPERATURE: 0.3,                      // Low temp for factual, grounded outputs
  MAX_SOURCE_CHARS: 1000,                // Truncate each source to prevent overflow
  MAX_TOTAL_CONTEXT_CHARS: 30000,        // Total context window budget
  MAX_RETRY_ATTEMPTS: 2,                 // Retry on transient failures
  RESPONSE_FORMAT: { type: "json_object" as const }, // Enforce JSON output
} as const;

/**
 * Error types for structured error handling
 */
enum AnswerAgentErrorType {
  LLM_API_ERROR = 'LLM_API_ERROR',           // OpenAI API failure
  INVALID_JSON = 'INVALID_JSON',             // LLM returned malformed JSON
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // Response doesn't match schema
  NO_API_KEY = 'NO_API_KEY',                 // Missing API key
}

/**
 * Custom error class for answer agent failures
 */
class AnswerAgentError extends Error {
  constructor(
    public type: AnswerAgentErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AnswerAgentError';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncates source content to fit within token budget
 * Prioritizes snippet for conciseness (Exa already highlights relevant parts)
 *
 * @param source - Source object to truncate
 * @param maxChars - Maximum characters per source
 * @returns Truncated content string
 */
function truncateSourceContent(source: Source, maxChars: number): string {
  // Prefer snippet (already optimized by Exa), fallback to full_text
  const content = source.snippet || source.full_text || '';

  if (content.length <= maxChars) {
    return content;
  }

  // Smart truncation: try to end at sentence boundary
  const truncated = content.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutoff = Math.max(lastPeriod, lastNewline);

  if (cutoff > maxChars * 0.8) {
    // If we found a good break point in the last 20%, use it
    return truncated.substring(0, cutoff + 1) + ' [...]';
  }

  return truncated + '...';
}

export function cleanMarkdownLinks(content: string): string {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

  return content.replace(markdownLinkRegex, (_, text, url) => {
    try {
      const u = new URL(url);

      // Remove literal `www.` subdomain
      const hostname = u.hostname.replace(/^www\./i, "");

      const base = `${hostname}/...`;
      return `[${text}](${base})`;
    } catch {
      // If URL parsing fails, keep original
      return `[${text}](${url})`;
    }
  });
}

/**
 * Formats sources for inclusion in LLM prompt
 * Creates a structured, numbered list with IDs, titles, URLs, and content
 *
 * @param sources - Array of sources from research agent
 * @returns Formatted string for prompt inclusion
 */
function formatSourcesForPrompt(sources: Source[]): string {
  if (sources.length === 0) {
    return 'No sources available.';
  }

  let totalChars = 0;
  const formattedSources: string[] = [];

  for (const source of sources) {
    const content = truncateSourceContent(source, LLM_CONFIG.MAX_SOURCE_CHARS);

    // Format source with clear structure
    const sourceBlock = `[${source.id}] Title: ${source.title}
Content: ${cleanMarkdownLinks(content)}
---`;

    // Check if adding this source would exceed total budget
    if (totalChars + sourceBlock.length > LLM_CONFIG.MAX_TOTAL_CONTEXT_CHARS) {
      console.warn(
        `[AnswerAgent] Truncated sources at ${formattedSources.length}/${sources.length} ` +
        `due to context limit (${totalChars} chars)`
      );
      break;
    }

    formattedSources.push(sourceBlock);
    totalChars += sourceBlock.length;
  }

  return formattedSources.join('\n\n');
}

/**
 * Validates that LLM response matches expected AnswerPayload schema
 * Checks structure, types, and source_id references
 *
 * @param response - Parsed JSON from LLM
 * @param validSourceIds - Set of valid source IDs for validation
 * @returns Typed AnswerPayload if valid
 * @throws AnswerAgentError if validation fails
 */
function validateLLMResponse(
  response: unknown,
  validSourceIds: Set<string>
): AnswerPayload {
  // Type guard: check basic structure
  if (!response || typeof response !== 'object') {
    throw new AnswerAgentError(
      AnswerAgentErrorType.VALIDATION_ERROR,
      'LLM response is not an object'
    );
  }

  const payload = response as Record<string, unknown>;

  // Validate 'text' field
  if (typeof payload.text !== 'string' || payload.text.trim().length === 0) {
    throw new AnswerAgentError(
      AnswerAgentErrorType.VALIDATION_ERROR,
      'Missing or invalid "text" field in LLM response'
    );
  }

  // Validate 'blocks' field
  if (!Array.isArray(payload.blocks) || payload.blocks.length === 0) {
    throw new AnswerAgentError(
      AnswerAgentErrorType.VALIDATION_ERROR,
      'Missing or empty "blocks" array in LLM response'
    );
  }

  // Validate each block
  const validatedBlocks: AnswerBlock[] = [];

  for (let i = 0; i < payload.blocks.length; i++) {
    const block = payload.blocks[i];

    if (!block || typeof block !== 'object') {
      throw new AnswerAgentError(
        AnswerAgentErrorType.VALIDATION_ERROR,
        `Block ${i} is not an object`
      );
    }

    const b = block as Record<string, unknown>;

    // Validate block.id
    if (typeof b.id !== 'string' || !b.id.startsWith('ans-')) {
      throw new AnswerAgentError(
        AnswerAgentErrorType.VALIDATION_ERROR,
        `Block ${i} has invalid id: ${b.id}`
      );
    }

    // Validate block.type
    if (b.type !== 'paragraph' && b.type !== 'bullet') {
      throw new AnswerAgentError(
        AnswerAgentErrorType.VALIDATION_ERROR,
        `Block ${i} has invalid type: ${b.type}`
      );
    }

    // Validate block.text
    if (typeof b.text !== 'string' || b.text.trim().length === 0) {
      throw new AnswerAgentError(
        AnswerAgentErrorType.VALIDATION_ERROR,
        `Block ${i} has invalid text`
      );
    }

    // Validate block.source_ids
    if (!Array.isArray(b.source_ids)) {
      throw new AnswerAgentError(
        AnswerAgentErrorType.VALIDATION_ERROR,
        `Block ${i} has invalid source_ids (not an array)`
      );
    }

    // Filter out invalid source IDs but keep the block
    const validSourceIdsForBlock = b.source_ids.filter((sourceId): sourceId is string => {
      if (typeof sourceId !== 'string') {
        console.warn(`[AnswerAgent] Block ${i} contains non-string source_id: ${sourceId}`);
        return false;
      }

      if (!validSourceIds.has(sourceId)) {
        console.warn(`[AnswerAgent] Block ${i} references invalid source_id: ${sourceId}`);
        return false;
      }

      return true;
    });

    validatedBlocks.push({
      id: b.id as string,
      type: b.type as 'paragraph' | 'bullet',
      text: b.text as string,
      source_ids: validSourceIdsForBlock,
    });
  }

  return {
    text: payload.text as string,
    blocks: validatedBlocks,
  };
}

/**
 * Logs prompt metrics (character count + approximate tokens)
 */
function logPromptUsage(
  stage: string,
  messages: { role: string; content?: string }[],
  sourceChars: number,
  sourceCount: number
): void {
  const totalChars = messages.reduce(
    (sum, msg) => sum + (msg.content?.length ?? 0),
    0
  );
  const approxTokens = Math.ceil(totalChars / 4);
  console.log(
    `[AnswerAgent] ${stage}: ${totalChars} chars (~${approxTokens} tokens); ` +
    `sources=${sourceCount}, source payload=${sourceChars} chars`
  );
}

/**
 * Creates a fallback answer when LLM fails after all retries
 * Ensures /api/answer never returns 500 error
 *
 * @param question - The user's question
 * @param sources - Available sources
 * @returns Minimal valid AnswerPayload
 */
function createFallbackAnswer(
  question: string,
  sources: Source[]
): AnswerPayload {
  console.warn('[AnswerAgent] Using fallback answer due to LLM failure');

  const blocks: AnswerBlock[] = [];

  if (sources.length === 0) {
    blocks.push({
      id: 'ans-1',
      type: 'paragraph',
      text: 'No sources were found to answer this question. Please try rephrasing your query or providing more context.',
      source_ids: [],
    });
  } else {
    // Create a simple answer listing available sources
    blocks.push({
      id: 'ans-1',
      type: 'paragraph',
      text: `I found ${sources.length} relevant source(s) related to: "${question}". However, I encountered an error generating a detailed answer. Please review the sources below.`,
      source_ids: sources.map(s => s.id),
    });

    // Add first source as a sample
    if (sources[0]) {
      blocks.push({
        id: 'ans-2',
        type: 'paragraph',
        text: `From "${sources[0].title}": ${sources[0].snippet}`,
        source_ids: [sources[0].id],
      });
    }
  }

  const text = blocks.map(b => b.text).join(' ');

  return { text, blocks };
}

// ============================================================================
// PROMPT ENGINEERING
// ============================================================================

/**
 * Builds the system message for LLM
 * Defines the assistant's role, constraints, and output format
 *
 * @returns System message string
 */
function buildSystemMessage(): string {
  return `You are a precise research assistant. Use ONLY the supplied sources to answer the question.

Constraints:
- Cite sources by their IDs (e.g., "s1", "s2") in every block's source_ids array.
- If the sources lack the answer, say so explicitly and avoid hallucinations.
- Break your response into conceptual blocks, each representing one idea.
- Each block should reference at least one source (preferably 2-4).
- Use the structure below and return VALID JSON only.

Response format:
{
  "text": "The complete answer as prose (concatenated block text).",
  "blocks": [
    {
      "id": "ans-1",
      "type": "paragraph" | "bullet",
      "text": "...",
      "source_ids": ["s1", "s2"]
    }
  ]
}

Keep blocks sequential ("ans-1", "ans-2", ...), avoid duplicating IDs, and keep each block focused on a single concept.`;
}

/**
 * Builds the user message with question and formatted sources
 *
 * @param question - The user's question
 * @param formattedSources - Pre-formatted source string
 * @returns User message string
 */
function buildUserMessage(
  question: string,
  formattedSources: string
): string {
  return `Question: ${question}

Available Sources:
${formattedSources}

Generate a comprehensive answer using ONLY the information from these sources. Return your response as JSON matching the required schema.`;
}

// ============================================================================
// MAIN ANSWER AGENT FUNCTION
// ============================================================================

/**
 * Generates an answer to the question using LLM and provided sources
 *
 * Flow:
 * 1. Validate API key configuration
 * 2. Format sources for prompt
 * 3. Call OpenAI API with retry logic
 * 4. Parse and validate JSON response
 * 5. Return structured answer or fallback
 *
 * @param question - The user's question
 * @param sources - Array of sources from research agent
 * @returns AnswerPayload with structured answer blocks and source citations
 */
export async function answerAgent(
  question: string,
  sources: Source[]
): Promise<AnswerPayload> {
  console.log(`[AnswerAgent] Generating answer for: "${question}"`);
  console.log(`[AnswerAgent] Using ${sources.length} sources`);

  // Check API key
  if (!config.llmApiKey) {
    console.warn('[AnswerAgent] LLM_API_KEY not configured, using fallback');
    return createFallbackAnswer(question, sources);
  }

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: config.llmApiKey,
  });

  // Build valid source ID set for validation
  const validSourceIds = new Set(sources.map(s => s.id));

  // Format sources for prompt
  const formattedSources = formatSourcesForPrompt(sources);
  const systemMessage = buildSystemMessage();
  const userMessage = buildUserMessage(question, formattedSources);
  const promptMessages = [
    { role: 'system' as const, content: systemMessage },
    { role: 'user' as const, content: userMessage },
  ];
  console.log(`\n\n${JSON.stringify(promptMessages)}\n\n`);
  logPromptUsage('Prompt payload', promptMessages, formattedSources.length, sources.length);

  // Retry loop
  for (let attempt = 1; attempt <= LLM_CONFIG.MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`[AnswerAgent] LLM request attempt ${attempt}/${LLM_CONFIG.MAX_RETRY_ATTEMPTS}`);

      const startTime = Date.now();

      // Call OpenAI API
      const completion = await client.chat.completions.create({
        model: LLM_CONFIG.MODEL,
        messages: promptMessages,
        temperature: LLM_CONFIG.TEMPERATURE,
        max_tokens: LLM_CONFIG.MAX_TOKENS,
        response_format: LLM_CONFIG.RESPONSE_FORMAT,
      });

      const latencyMs = Date.now() - startTime;
      console.log(`[AnswerAgent] LLM response received in ${latencyMs}ms`);

      // Extract response content
      const content = completion.choices[0]?.message?.content;
      console.log(`\n\n${content}\n\n`);

      if (!content) {
        throw new AnswerAgentError(
          AnswerAgentErrorType.LLM_API_ERROR,
          'LLM returned empty response'
        );
      }

      // Log token usage
      if (completion.usage) {
        console.log(
          `[AnswerAgent] Token usage: ` +
          `${completion.usage.prompt_tokens} prompt + ` +
          `${completion.usage.completion_tokens} completion = ` +
          `${completion.usage.total_tokens} total`
        );
      }

      // Parse JSON
      let parsedResponse: unknown;
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        throw new AnswerAgentError(
          AnswerAgentErrorType.INVALID_JSON,
          'LLM response is not valid JSON',
          error
        );
      }

      // Validate response schema
      const validatedPayload = validateLLMResponse(parsedResponse, validSourceIds);

      console.log(
        `[AnswerAgent] Successfully generated answer with ${validatedPayload.blocks.length} blocks`
      );

      return validatedPayload;

    } catch (error) {
      // Log error details
      console.error(
        `[AnswerAgent] Attempt ${attempt} failed:`,
        error instanceof AnswerAgentError ? error.message : error
      );

      // If this is the last attempt, fall back
      if (attempt === LLM_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.error('[AnswerAgent] All retry attempts exhausted');
        return createFallbackAnswer(question, sources);
      }

      // Don't retry on validation errors (they won't fix themselves)
      if (error instanceof AnswerAgentError) {
        if (
          error.type === AnswerAgentErrorType.VALIDATION_ERROR ||
          error.type === AnswerAgentErrorType.INVALID_JSON
        ) {
          console.error('[AnswerAgent] Non-retryable error, using fallback');
          return createFallbackAnswer(question, sources);
        }
      }

      // Wait before retry (exponential backoff)
      const delayMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`[AnswerAgent] Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Should never reach here, but TypeScript needs this
  return createFallbackAnswer(question, sources);
}
