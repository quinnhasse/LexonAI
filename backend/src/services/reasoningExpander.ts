import OpenAI from 'openai';
import { config } from '../config/env.js';

const MODEL = 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.45;
const MAX_TOKENS = 500;
const MAX_WORDS = 135;

/**
 * Expands a user's reasoning snippet for a given title.
 * Uses gpt-4o-mini to add a bit more depth without being overly exhaustive.
 */
export async function expandReasoning(title: string, reasoning: string): Promise<string> {
  if (!config.llmApiKey) {
    throw new Error('LLM_API_KEY is not configured');
  }

  const client = new OpenAI({ apiKey: config.llmApiKey });

  const systemMessage = `You are a concise but informative explainer.`;
  const userMessage = `
Title: ${title}
Reasoning: ${reasoning}

Instruction: Expand on the reasoning above. Add a few sentences that build on the current explanation so the reader learns a bit more about what makes this title important or interesting. Do not just repeat the existing text; add new context, examples, or clarifications. Keep it informative without becoming exhaustive and target no more than ${MAX_WORDS} words.

Expanded reasoning:`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: MAX_TOKENS,
  });

  const expanded = completion.choices[0]?.message?.content?.trim() || '';
  if (!expanded) {
    throw new Error('LLM did not return expanded reasoning');
  }

  return expanded;
}
