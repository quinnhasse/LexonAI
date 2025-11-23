/**
 * Research Agent - Exa-based RAG system
 * Fetches and structures sources from the web using Exa API
 */

import { Source } from '../types/shared';
import { config } from '../config/env';
import { getDensityConfig, DEFAULT_DENSITY, DensityLevel } from '../config/density';

/**
 * Exa API request interface
 * Defines the structure for search requests to Exa
 */
interface ExaSearchRequest {
  query: string;
  numResults?: number;
  type?: 'auto' | 'neural' | 'fast' | 'deep';
  text?: boolean | {
    maxCharacters?: number;
    includeHtmlTags?: boolean;
  };
  highlights?: boolean | {
    numSentences?: number;
    highlightsPerUrl?: number;
    query?: string;
  };
  category?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  startPublishedDate?: string;
  endPublishedDate?: string;
}

/**
 * Exa API response interface
 * Defines the structure of search results from Exa
 */
interface ExaSearchResponse {
  requestId: string;
  resolvedSearchType: 'neural' | 'deep';
  results: ExaSearchResult[];
  costDollars?: {
    search?: number;
    contents?: number;
    total?: number;
  };
}

/**
 * Individual search result from Exa
 */
interface ExaSearchResult {
  title: string;
  url: string;
  id: string;
  score: number;
  publishedDate?: string;
  author?: string | null;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  favicon?: string;
  image?: string;
}

/**
 * Returns stub sources for testing when Exa API is not available
 *
 * @param question - The user's question (used to make stubs more realistic)
 * @returns Array of stub Source objects
 */
function getStubSources(question: string): Source[] {
  console.log('[ResearchAgent] Using stub sources (Exa API not available)');

  return [
    {
      id: 's1',
      title: 'AI Transparency Best Practices',
      url: 'https://example.com/ai-transparency',
      snippet: 'AI transparency is crucial for building trust in automated systems. Research shows that explainable AI leads to better user adoption and understanding.',
      full_text: 'AI transparency refers to the practice of making AI systems understandable and accountable. This includes explaining how decisions are made, what data is used, and providing clear reasoning paths.',
      score: 0.95,
      metadata: {
        provider: 'stub',
        published_date: '2024-01-15',
        author: 'AI Research Team'
      }
    },
    {
      id: 's2',
      title: 'Evidence-Based AI Systems',
      url: 'https://example.com/evidence-based-ai',
      snippet: 'Evidence-based AI systems provide citations and sources for their answers, allowing users to verify claims independently and build trust in AI outputs.',
      full_text: 'Modern AI systems are incorporating evidence-based approaches where every claim is backed by specific sources. This transparency allows users to trace the origin of information and verify its accuracy.',
      score: 0.88,
      metadata: {
        provider: 'stub',
        published_date: '2024-02-20',
        domain: 'example.com'
      }
    },
    {
      id: 's3',
      title: 'Retrieval-Augmented Generation Overview',
      url: 'https://example.com/rag-systems',
      snippet: 'Retrieval-Augmented Generation (RAG) combines information retrieval with language models to produce grounded, factual responses with verifiable sources.',
      full_text: 'RAG systems first retrieve relevant documents from a knowledge base, then use those documents to generate answers. This approach reduces hallucinations and provides transparency through source attribution.',
      score: 0.82,
      metadata: {
        provider: 'stub',
        published_date: '2024-03-10'
      }
    }
  ];
}

/**
 * Performs research using Exa API to find relevant sources for a given question
 *
 * This function:
 * 1. Validates that EXA_API_KEY is configured
 * 2. Constructs a search request optimized for RAG use cases
 * 3. Calls the Exa search API with parameters to retrieve:
 *    - Top N most relevant results (configurable via density level, default 10)
 *    - Full text content (up to 10,000 characters)
 *    - Highlights/snippets (3 sentences, up to 5 per URL)
 * 4. Maps Exa results to the Source type defined in shared.ts
 * 5. Falls back to stub sources if API key is missing or request fails
 *
 * @param question - The user's question to research
 * @param densityLevel - Graph density level (low/medium/high), defaults to medium
 * @returns Promise<Source[]> - Array of structured Source objects with URLs, snippets, and metadata
 */
export async function researchAgent(
  question: string,
  densityLevel: DensityLevel = DEFAULT_DENSITY
): Promise<Source[]> {
  console.log(`[ResearchAgent] Searching for: "${question}"`);

  // Get density configuration
  const densityConfig = getDensityConfig(densityLevel);
  const numResults = densityConfig.exaNumResults;

  console.log(`[ResearchAgent] Density level: ${densityLevel} (${numResults} results)`);

  // Check if API key is configured
  if (!config.exaApiKey) {
    console.warn('[ResearchAgent] EXA_API_KEY not configured, using stub sources');
    return getStubSources(question);
  }

  try {
    // Construct Exa search request optimized for RAG
    // - numResults: configurable via density level (6-12)
    // - type: 'auto' lets Exa choose best search method (neural vs deep)
    // Note: text and highlights need to be requested in a separate 'contents' parameter
    const searchRequest: ExaSearchRequest = {
      query: question,
      numResults,
      type: 'auto'
    };

    // Request content details (text + highlights)
    // These are added as a top-level parameter in the request
    const requestBody = {
      ...searchRequest,
      contents: {
        text: {
          maxCharacters: 1500,
          includeHtmlTags: false
        },
        highlights: {
          numSentences: 3,
          highlightsPerUrl: 5
        }
      }
    };

    console.log('[ResearchAgent] Calling Exa API...');

    // Call Exa search API
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': config.exaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Error text is not JSON, use as-is
        if (errorText) errorMessage += ` - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json() as ExaSearchResponse;

    console.log(`[ResearchAgent] Got ${data.results.reduce((sum, result) => sum + (result.text?.length || 0), 0)}`)
    console.log(`[ResearchAgent] Retrieved ${data.results.length} results from Exa`);
    console.log(`[ResearchAgent] Search type used: ${data.resolvedSearchType}`);
    if (data.costDollars?.total) {
      console.log(`[ResearchAgent] API cost: $${data.costDollars.total.toFixed(4)}`);
    }

    // Map Exa results to Source type
    const sources: Source[] = data.results.map((result, index) => {
      // Create snippet from highlights if available, otherwise use beginning of text
      let snippet = '';
      if (result.highlights && result.highlights.length > 0) {
        snippet = result.highlights[0];
      } else if (result.text) {
        // Take first 200 chars as snippet
        snippet = result.text.substring(0, 200).trim();
        if (result.text.length > 200) snippet += '...';
      }

      // Calculate a pseudo-score based on position if score is not provided
      // Exa returns results in relevance order, so higher positions = better
      const scoreValue = result.score !== undefined
        ? result.score
        : 1.0 - (index * 0.1); // Decreasing score: 1.0, 0.9, 0.8, 0.7, 0.6

      return {
        id: `s${index + 1}`,
        title: result.title,
        url: result.url,
        snippet,
        full_text: result.text,
        score: scoreValue,
        metadata: {
          provider: 'exa',
          exa_id: result.id,
          published_date: result.publishedDate,
          author: result.author,
          highlights: result.highlights,
          highlight_scores: result.highlightScores,
          favicon: result.favicon,
          image: result.image,
          original_score: result.score
        }
      };
    });

    // Log summary of sources for transparency
    sources.forEach(source => {
      console.log(`[ResearchAgent]   - ${source.id}: ${source.title} (score: ${source.score?.toFixed(2)})`);
    });

    return sources;

  } catch (error) {
    // Log error and fall back to stub sources to keep pipeline working
    console.error('[ResearchAgent] Error calling Exa API:', error);
    console.warn('[ResearchAgent] Falling back to stub sources');
    return getStubSources(question);
  }
}
