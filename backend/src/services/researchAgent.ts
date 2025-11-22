/**
 * Research Agent - Exa-based RAG system
 * Fetches and structures sources from the web using Exa API
 */

import { Source } from '../types/shared';
import { config } from '../config/env';

/**
 * Performs research using Exa API to find relevant sources for a given question
 *
 * @param question - The user's question to research
 * @returns Array of structured Source objects with URLs, snippets, and metadata
 *
 * TODO: Implement actual Exa integration
 * - Use config.EXA_API_KEY for authentication
 * - Call Exa's search API with the question
 * - Map Exa results to Source type:
 *   - id: generate unique IDs (e.g., "s1", "s2", ...)
 *   - title: from Exa result title
 *   - url: from Exa result URL
 *   - snippet: from Exa result text/summary
 *   - full_text: optional full page content if available
 *   - score: relevance score from Exa
 *   - metadata: any additional Exa metadata
 * - Handle errors and rate limits appropriately
 * - Consider caching results for repeated queries
 */
export async function researchAgent(question: string): Promise<Source[]> {
  // Stub implementation for testing
  console.log(`[ResearchAgent] Searching for: "${question}"`);
  console.log(`[ResearchAgent] EXA_API_KEY configured: ${!!config.EXA_API_KEY}`);

  // Return placeholder sources to enable end-to-end testing
  const stubSources: Source[] = [
    {
      id: 's1',
      title: 'Example Source 1 - AI Transparency Research',
      url: 'https://example.com/ai-transparency',
      snippet: 'AI transparency is crucial for building trust in automated systems. Research shows that explainable AI leads to better user adoption.',
      score: 0.95,
      metadata: {
        published_date: '2024-01-15',
        author: 'Research Team'
      }
    },
    {
      id: 's2',
      title: 'Example Source 2 - Evidence-Based AI',
      url: 'https://example.com/evidence-based-ai',
      snippet: 'Evidence-based AI systems provide citations and sources for their answers, allowing users to verify claims independently.',
      score: 0.88,
      metadata: {
        published_date: '2024-02-20',
        domain: 'example.com'
      }
    },
    {
      id: 's3',
      title: 'Example Source 3 - RAG Systems Overview',
      url: 'https://example.com/rag-systems',
      snippet: 'Retrieval-Augmented Generation (RAG) combines information retrieval with language models to produce grounded, factual responses.',
      score: 0.82,
      metadata: {
        published_date: '2024-03-10'
      }
    }
  ];

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return stubSources;
}
