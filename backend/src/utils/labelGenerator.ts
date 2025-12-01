/**
 * Label Generator Utility
 * Generates short labels (1-3 words) for evidence graph nodes
 * Used by the 3D visualization frontend
 */

import OpenAI from 'openai';
import { config } from '../config/env.js';

// ============================================================================
// DOMAIN BRAND EXTRACTION
// ============================================================================

/**
 * Extracts a brand name from a URL domain
 * Examples:
 *   - https://www.zendesk.com/blog/... → "Zendesk"
 *   - https://www.ibm.com/think/... → "IBM"
 *   - https://www.geeksforgeeks.org/... → "GeeksforGeeks"
 *
 * @param url - The source URL
 * @returns Brand name or empty string if extraction fails
 */
export function extractDomainBrand(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // Remove www. prefix
    hostname = hostname.replace(/^www\./, '');

    // Extract second-level domain (before TLD)
    // e.g., zendesk.com → zendesk, ibm.com → ibm
    const parts = hostname.split('.');
    if (parts.length < 2) {
      return '';
    }

    const domain = parts[parts.length - 2];

    // Handle special cases for well-known brands
    const upperDomain = domain.toUpperCase();
    if (['IBM', 'AWS', 'MIT', 'UC', 'AI'].includes(upperDomain)) {
      return upperDomain;
    }

    // Standard capitalization: first letter uppercase
    // Handle camelCase domains like "geeksforgeeks" → "GeeksforGeeks"
    return capitalizeWords(domain);
  } catch (error) {
    console.warn(`[LabelGenerator] Failed to extract domain from URL: ${url}`);
    return '';
  }
}

/**
 * Capitalizes the first letter of a word
 * Handles camelCase by preserving internal capitals
 */
function capitalizeWords(text: string): string {
  if (!text) return '';

  // If already has internal capitals (like "geeksForGeeks"), preserve them
  if (/[A-Z]/.test(text.slice(1))) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Otherwise, simple title case
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================================================
// QUESTION LABEL GENERATION
// ============================================================================

/**
 * Generates a short topic label from a question
 * Extracts 2-3 key meaningful words
 *
 * Examples:
 *   - "What is AI transparency?" → "AI transparency"
 *   - "How can we ensure fairness in hiring models?" → "Fair hiring"
 *
 * @param question - The user's question
 * @returns Short topic label (2-3 words)
 */
export function generateQuestionLabel(question: string): string {
  // Remove question marks and common question words
  let cleaned = question
    .replace(/\?/g, '')
    .trim();

  // Remove common question starters
  const starters = /^(what|how|why|when|where|who|which|can|could|would|should|is|are|does|do|did)\s+(is|are|does|do|can|could|would|should|the|a|an|we|you|they|it)\s+/i;
  cleaned = cleaned.replace(starters, '');

  // Also try simpler version
  const simpleStarters = /^(what|how|why|when|where|who|which|can|could|would|should|is|are|does|do|did)\s+/i;
  cleaned = cleaned.replace(simpleStarters, '');

  // Take first 2-4 words
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  // Filter out very short filler words
  const meaningfulWords = words.filter(w =>
    w.length > 2 || ['AI', 'ML', 'LLM', 'NLP', 'API'].includes(w.toUpperCase())
  );

  // Take first 2-3 meaningful words
  const labelWords = meaningfulWords.slice(0, 3);

  if (labelWords.length === 0) {
    // Fallback: just take first few words
    return words.slice(0, 3).join(' ');
  }

  return labelWords.join(' ');
}

// ============================================================================
// SOURCE LABEL GENERATION
// ============================================================================

/**
 * Generates a short label for a direct source node
 * Prefers domain brand, falls back to compressed title
 *
 * @param title - The source title
 * @param url - The source URL
 * @returns Short label (1-3 words)
 */
export function generateSourceLabel(title: string, url: string): string {
  // Try to extract brand from domain
  const brand = extractDomainBrand(url);
  if (brand) {
    return brand;
  }

  // Fallback: compress title to 2-3 words
  const words = title.split(/\s+/).filter(w => w.length > 0);

  // Remove common suffixes like "- Company Name"
  let cleanWords = words;
  const dashIndex = words.findIndex(w => w === '-' || w === '|' || w === '–');
  if (dashIndex > 0) {
    cleanWords = words.slice(0, dashIndex);
  }

  // Filter meaningful words
  const meaningfulWords = cleanWords.filter(w =>
    w.length > 2 || ['AI', 'ML', 'LLM', 'NLP', 'API'].includes(w.toUpperCase())
  );

  return meaningfulWords.slice(0, 3).join(' ') || 'Source';
}

// ============================================================================
// ANSWER BLOCK LABEL GENERATION (LLM)
// ============================================================================

let openaiClient: OpenAI | null = null;

/**
 * Gets or creates OpenAI client
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!config.llmApiKey) {
      throw new Error('LLM_API_KEY not configured');
    }
    openaiClient = new OpenAI({
      apiKey: config.llmApiKey,
    });
  }
  return openaiClient;
}

/**
 * Generates a 1-3 word section title for an answer block using LLM
 *
 * Examples:
 *   - Block explaining definition → "Definition"
 *   - Block listing benefits → "Key benefits"
 *   - Block covering risks → "Risks"
 *   - Block covering regulations → "Regulation"
 *
 * @param blockText - The answer block text
 * @returns Short section label (1-3 words)
 */
export async function generateAnswerBlockLabel(blockText: string): Promise<string> {
  try {
    const client = getOpenAIClient();

    // Truncate very long blocks
    const truncatedText = blockText.length > 500
      ? blockText.substring(0, 500) + '...'
      : blockText;

    const prompt = `You will be given a paragraph of an answer.
Return a single label of 1–3 words that best summarizes this paragraph for a non-expert.

Rules:
- No punctuation.
- No quotes.
- Use title case or normal case, but keep it short.

Examples:
- "Definition"
- "Key benefits"
- "Ethical risks"
- "Regulation"

Output ONLY the label, nothing else.

Paragraph:
${truncatedText}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const label = completion.choices[0]?.message?.content?.trim() || '';

    // Remove quotes if LLM added them despite instructions
    const cleaned = label.replace(/^["']|["']$/g, '').trim();

    // Validate: should be 1-3 words, no punctuation except hyphens
    const words = cleaned.split(/\s+/);
    if (words.length > 0 && words.length <= 4) {
      return cleaned;
    }

    // Fallback: use simple heuristic
    return generateSimpleBlockLabel(blockText);
  } catch (error) {
    console.warn(`[LabelGenerator] LLM call failed for answer block label: ${error}`);
    return generateSimpleBlockLabel(blockText);
  }
}

/**
 * Simple heuristic fallback for answer block labels
 * Used when LLM is unavailable or fails
 */
function generateSimpleBlockLabel(blockText: string): string {
  const lower = blockText.toLowerCase();

  // Pattern matching for common section types
  if (lower.includes('definition') || lower.includes('what is') || lower.includes('refers to')) {
    return 'Definition';
  }
  if (lower.includes('benefit') || lower.includes('advantage')) {
    return 'Benefits';
  }
  if (lower.includes('risk') || lower.includes('challenge') || lower.includes('concern')) {
    return 'Risks';
  }
  if (lower.includes('regulation') || lower.includes('legal') || lower.includes('compliance')) {
    return 'Regulation';
  }
  if (lower.includes('example') || lower.includes('instance')) {
    return 'Examples';
  }
  if (lower.includes('how to') || lower.includes('step') || lower.includes('implement')) {
    return 'Implementation';
  }
  if (lower.includes('future') || lower.includes('trend') || lower.includes('outlook')) {
    return 'Future trends';
  }

  // Default fallback
  return 'Overview';
}

// ============================================================================
// BATCH LABEL GENERATION
// ============================================================================

/**
 * Generates labels for multiple answer blocks in parallel
 * More efficient than calling generateAnswerBlockLabel sequentially
 *
 * @param blocks - Array of block texts
 * @returns Array of labels in same order
 */
export async function generateAnswerBlockLabels(blockTexts: string[]): Promise<string[]> {
  if (blockTexts.length === 0) return [];

  try {
    return await generateBatchedBlockLabels(blockTexts);
  } catch (error) {
    console.warn(`[LabelGenerator] Batched label generation failed, falling back to single calls: ${error}`);
    const labels = await Promise.all(blockTexts.map(text => generateAnswerBlockLabel(text)));
    return labels;
  }
}

/**
 * Configuration for batched block label prompts
 */
const BATCH_LABEL_CONFIG = {
  MAX_BLOCK_CHARS: 500,
  MAX_TOKENS: 200,
};

/**
 * Truncates block text for batched prompt to avoid blowing up token limits
 */
function truncateBlockForBatchLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutoff = Math.max(lastPeriod, lastNewline);
  if (cutoff > maxChars * 0.7) {
    return truncated.substring(0, cutoff + 1) + ' [...]';
  }
  return truncated + '...';
}

/**
 * Cleans a label to meet constraints (1-3 words, no extra quotes)
 */
function cleanLabel(label: string): string {
  const trimmed = (label || '').trim().replace(/^["']|["']$/g, '');
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Overview';
  if (words.length <= 3) return trimmed;
  return words.slice(0, 3).join(' ');
}

/**
 * Builds the user prompt for batching block labels
 */
function buildBatchLabelPrompt(blocks: string[]): string {
  const sanitizedBlocks: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const truncated = truncateBlockForBatchLabel(blocks[i], BATCH_LABEL_CONFIG.MAX_BLOCK_CHARS);
    sanitizedBlocks.push(`Block ${i + 1}:\n${truncated}`);
  }

  return `You will be given ${sanitizedBlocks.length} answer paragraphs.
Provide a concise label of 1-3 words that summarizes each paragraph for a non-expert audience.
Rules:
- No punctuation.
- No quotes.
- Use title case or normal case.
- Return ONLY a JSON object with this exact schema:
{
  "labels": [
    "Label for Block 1",
    "Label for Block 2",
    ...
  ]
}
Maintain the original block order.

Input:
${sanitizedBlocks.join('\n\n')}`;
}

/**
 * Generates labels for multiple blocks in one LLM call
 */
async function generateBatchedBlockLabels(blockTexts: string[]): Promise<string[]> {
  const client = getOpenAIClient();

  const promptBlocks = buildBatchLabelPrompt(blockTexts);
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: promptBlocks }
    ],
    temperature: 0.3,
    max_tokens: BATCH_LABEL_CONFIG.MAX_TOKENS,
    response_format: { type: "json_object" as const },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('LLM returned empty batched label response');
  }

  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.labels)) {
    throw new Error('Batched label response missing labels array');
  }

  const labels = parsed.labels.map((label: unknown) => {
    if (typeof label !== 'string') return 'Overview';
    return cleanLabel(label);
  });

  if (labels.length < blockTexts.length) {
    throw new Error('Batched label response returned fewer labels than input blocks');
  }

  // Keep order, but ensure we only return as many as requested
  return labels.slice(0, blockTexts.length);
}
