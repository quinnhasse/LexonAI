/**
 * Answer Agent - LLM-based answer generation
 * Generates answers using ONLY the provided sources
 */

import { Source, AnswerPayload, AnswerBlock } from '../types/shared';
import { config } from '../config/env';

/**
 * Generates an answer to the question using ONLY the provided sources
 *
 * @param question - The user's question
 * @param sources - Array of sources from the research agent
 * @returns AnswerPayload with structured answer blocks and source citations
 *
 * TODO: Implement actual LLM integration
 * - Install LLM SDK (e.g., OpenAI or Anthropic Claude SDK)
 * - Use config.LLM_API_KEY for authentication
 *
 * LLM Prompt Structure:
 * ----------------------
 * System: You are a research assistant. Answer questions using ONLY the provided sources.
 *         You must cite sources using their IDs. Return your answer as JSON.
 *
 * User: Question: {question}
 *
 *       Available Sources:
 *       [s1] Title: {sources[0].title}
 *            URL: {sources[0].url}
 *            Content: {sources[0].snippet}
 *
 *       [s2] Title: {sources[1].title}
 *            ...
 *
 *       Return JSON matching this schema:
 *       {
 *         "text": "full answer text",
 *         "blocks": [
 *           {
 *             "id": "ans-1",
 *             "type": "paragraph" | "bullet",
 *             "text": "block content",
 *             "source_ids": ["s1", "s3"]
 *           }
 *         ]
 *       }
 *
 * Important constraints for the LLM:
 * - ONLY use information from the provided sources
 * - ALWAYS cite source IDs in source_ids arrays
 * - Break answer into logical blocks (paragraphs or bullet points)
 * - Each block should have clear source attribution
 * - If sources don't contain enough information, say so explicitly
 */
export async function answerAgent(
  question: string,
  sources: Source[]
): Promise<AnswerPayload> {
  console.log(`[AnswerAgent] Generating answer for: "${question}"`);
  console.log(`[AnswerAgent] Using ${sources.length} sources`);
  console.log(`[AnswerAgent] LLM_API_KEY configured: ${!!config.LLM_API_KEY}`);

  // Stub implementation for testing
  // This simulates what the LLM would return

  const blocks: AnswerBlock[] = [
    {
      id: 'ans-1',
      type: 'paragraph',
      text: `Based on the available research, ${question.toLowerCase().replace(/\?$/, '')} involves several key aspects.`,
      source_ids: ['s1', 's2']
    },
    {
      id: 'ans-2',
      type: 'paragraph',
      text: sources.length > 0
        ? `According to current sources, ${sources[0].snippet}`
        : 'No sources available to provide a detailed answer.',
      source_ids: sources.length > 0 ? [sources[0].id] : []
    }
  ];

  // If we have multiple sources, add a bullet point summary
  if (sources.length > 1) {
    blocks.push({
      id: 'ans-3',
      type: 'bullet',
      text: `Key finding: ${sources[1]?.snippet || 'Additional research shows complementary evidence.'}`,
      source_ids: sources.length > 1 ? [sources[1].id] : []
    });
  }

  const fullText = blocks.map(b => b.text).join(' ');

  // Simulate LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    text: fullText,
    blocks
  };
}
