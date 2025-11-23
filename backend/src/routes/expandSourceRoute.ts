/**
 * Expand Source Route Handler
 * Exposes POST /api/expand/source endpoint for extracting concepts from a source
 *
 * This standalone endpoint allows extraction of secondary concepts from
 * an arbitrary source without requiring the full /ask pipeline.
 */

import { Request, Response, Express } from 'express';
import { expandSourceAgent, ExpandedConcept } from '../services/expandSourceAgent';
import { DensityLevel, DEFAULT_DENSITY } from '../config/density';

/**
 * Request body interface
 */
interface ExpandSourceRequest {
  /** Source title */
  title: string;

  /** Source URL */
  url: string;

  /** Full text content of the source */
  content: string;

  /** Optional density level (low/medium/high), defaults to medium */
  densityLevel?: DensityLevel;
}

/**
 * Response body interface
 */
interface ExpandSourceResponse {
  /** Extracted concepts */
  concepts: ExpandedConcept[];

  /** Metadata about the request */
  meta: {
    /** Processing latency in milliseconds */
    latencyMs: number;

    /** Density level used */
    densityLevel: DensityLevel;

    /** Source title */
    sourceTitle: string;

    /** Source URL */
    sourceUrl: string;
  };
}

/**
 * Validates DensityLevel from request
 */
function validateDensityLevel(level: unknown): DensityLevel {
  if (typeof level === 'string' && ['low', 'medium', 'high'].includes(level)) {
    return level as DensityLevel;
  }
  return DEFAULT_DENSITY;
}

/**
 * POST /api/expand/source
 *
 * Request body:
 * {
 *   "title": "What is Autism Spectrum Disorder (ASD)?",
 *   "url": "https://...",
 *   "content": "Full text content...",
 *   "densityLevel": "medium" (optional)
 * }
 *
 * Response: ExpandSourceResponse JSON object with:
 * - concepts: array of extracted concepts
 * - meta: timing and configuration information
 *
 * Error Handling:
 * - 400: Missing required fields or invalid input
 * - 500: Extraction failed
 */
async function handleExpandSource(req: Request, res: Response): Promise<void> {
  const requestStart = Date.now();

  try {
    // Validate request body
    const body = req.body as Partial<ExpandSourceRequest>;

    if (!body.title || typeof body.title !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "title" field',
        message: 'Request must include a string "title" field'
      });
      return;
    }

    if (!body.url || typeof body.url !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "url" field',
        message: 'Request must include a string "url" field'
      });
      return;
    }

    if (!body.content || typeof body.content !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "content" field',
        message: 'Request must include a string "content" field with the source text'
      });
      return;
    }

    if (body.content.length === 0) {
      res.status(400).json({
        error: 'Empty content',
        message: 'The "content" field cannot be empty'
      });
      return;
    }

    // Validate and default density level
    const densityLevel = validateDensityLevel(body.densityLevel);

    console.log(`[ExpandSourceRoute] Processing request for source: ${body.title}`);
    console.log(`[ExpandSourceRoute] Density level: ${densityLevel}`);

    // Extract concepts
    const concepts = await expandSourceAgent(
      {
        title: body.title,
        url: body.url,
        content: body.content
      },
      densityLevel
    );

    const latencyMs = Date.now() - requestStart;

    // Build response
    const response: ExpandSourceResponse = {
      concepts,
      meta: {
        latencyMs,
        densityLevel,
        sourceTitle: body.title,
        sourceUrl: body.url
      }
    };

    console.log(`[ExpandSourceRoute] Successfully extracted ${concepts.length} concepts in ${latencyMs}ms`);

    res.status(200).json(response);
  } catch (error) {
    const latencyMs = Date.now() - requestStart;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[ExpandSourceRoute] Error after ${latencyMs}ms: ${errorMsg}`);

    res.status(500).json({
      error: 'Concept extraction failed',
      message: errorMsg,
      meta: {
        latencyMs
      }
    });
  }
}

/**
 * Registers the expand source route with the Express app
 */
export function registerExpandSourceRoute(app: Express): void {
  app.post('/api/expand/source', handleExpandSource);
  console.log('[Routes] Registered POST /api/expand/source');
}
