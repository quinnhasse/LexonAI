/**
 * Answer Route Handler
 * Exposes POST /api/answer endpoint for answering questions with evidence
 *
 * Phase 5 Enhancements:
 * - Comprehensive error handling with graceful degradation
 * - Detailed logging with timestamps and latency tracking
 * - Never crashes the server - always returns meaningful responses
 */

import { Request, Response, Express } from 'express';
import { researchAgent } from '../services/researchAgent';
import { answerAgent } from '../services/answerAgent';
import { buildEvidenceGraph } from '../services/evidenceGraph';
import { AnswerResponse, AnswerPayload, Source, EvidenceGraph } from '../types/shared';
import { DensityLevel, DEFAULT_DENSITY, inferDensityLevel } from '../config/density';
import { progressManager } from '../services/progressManager';

interface AnswerRequest {
  question: string;
}

/**
 * Creates a fallback answer when the LLM fails
 */
function createFallbackAnswer(errorMessage: string): AnswerPayload {
  return {
    text: `Sorry, I could not generate an answer right now. ${errorMessage}`,
    blocks: [
      {
        id: 'ans-error-1',
        type: 'paragraph',
        text: `Sorry, I could not generate an answer right now. ${errorMessage}`,
        source_ids: []
      }
    ]
  };
}

/**
 * Creates a minimal evidence graph when graph building fails
 */
function createMinimalGraph(question: string): EvidenceGraph {
  return {
    nodes: [
      {
        id: 'q',
        type: 'question',
        label: question.slice(0, 80),
        metadata: { fullText: question, layer: 0 }
      }
    ],
    edges: [],
    metadata: {
      sourceCount: 0,
      blockCount: 0,
      createdAt: new Date()
    }
  };
}

/**
 * Formats timestamp for consistent logging
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * POST /api/answer
 *
 * Request body:
 * {
 *   "question": "What is AI transparency?"
 * }
 *
 * Response: AnswerResponse JSON object with:
 * - question: echoed back
 * - answer: structured answer with blocks
 * - sources: array of sources used
 * - evidence_graph: graph connecting question -> answer_root -> blocks -> sources
 * - meta: timing and model information
 *
 * Error Handling:
 * - Research failures: Continue with empty sources and note in meta
 * - Answer failures: Return fallback answer with sources (if available)
 * - Graph failures: Return minimal graph with question node only
 * - Never crashes - always returns 200 with partial data or 500 with error details
 */
async function handleAnswer(req: Request, res: Response): Promise<void> {
  const requestStart = Date.now();
  let sources: Source[] = [];
  let answer: AnswerPayload | null = null;
  let evidenceGraph: EvidenceGraph | null = null;
  let retrievalLatencyMs = 0;
  let answerLatencyMs = 0;
  let graphLatencyMs = 0;
  const errors: string[] = [];

  // Extract jobId from query params for progress tracking
  const jobId = req.query.jobId as string | undefined;

  try {
    const { question } = req.body as AnswerRequest;

    // ========================================================================
    // VALIDATION
    // ========================================================================
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      console.log(`[${getTimestamp()}] [API] Invalid request: Empty or non-string question`);
      res.status(400).json({
        error: 'Bad Request',
        message: 'Question must be a non-empty string'
      });
      return;
    }

    console.log(`[${getTimestamp()}] [API] ========================================`);
    console.log(`[${getTimestamp()}] [API] Request received: POST /api/answer`);
    console.log(`[${getTimestamp()}] [API] Question: "${question}"`);
    if (jobId) {
      console.log(`[${getTimestamp()}] [API] Job ID: ${jobId}`);
    }
    console.log(`[${getTimestamp()}] [API] ========================================`);

    // Initialize progress tracking if jobId provided
    if (jobId) {
      progressManager.createJob(jobId);
      progressManager.updateProgress(jobId, 0, 'Starting...', 'init');
    }

    // ========================================================================
    // DETERMINE DENSITY LEVEL
    // ========================================================================
    // Use default medium density for now - could be enhanced with user preference
    const densityLevel: DensityLevel = DEFAULT_DENSITY;

    console.log(`[${getTimestamp()}] [API] Density level: ${densityLevel.toUpperCase()}`);

    // ========================================================================
    // STEP 1: RESEARCH - Get sources using Exa (0% → 15%)
    // ========================================================================
    try {
      const retrievalStart = Date.now();
      console.log(`[${getTimestamp()}] [API] Starting research phase...`);

      // Update progress: Starting research
      if (jobId) {
        progressManager.updateProgress(jobId, 0, 'Searching neural networks', 'research');
      }

      sources = await researchAgent(question, densityLevel);
      retrievalLatencyMs = Date.now() - retrievalStart;

      // Update progress: Research complete
      if (jobId) {
        progressManager.updateProgress(jobId, 15, 'Research complete', 'research');
      }

      console.log(`[${getTimestamp()}] [API] ✓ Research complete`);
      console.log(`[${getTimestamp()}] [API]   - Sources retrieved: ${sources.length}`);
      console.log(`[${getTimestamp()}] [API]   - Retrieval latency: ${retrievalLatencyMs}ms`);

      if (sources.length === 0) {
        console.log(`[${getTimestamp()}] [API] ⚠ Warning: No sources found for question`);
        errors.push('No sources found');
      }
    } catch (error) {
      retrievalLatencyMs = Date.now() - requestStart;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${getTimestamp()}] [API] ✗ Research failed: ${errorMsg}`);
      errors.push(`Research failed: ${errorMsg}`);

      // Update progress even on failure
      if (jobId) {
        progressManager.updateProgress(jobId, 15, 'Research complete (degraded)', 'research');
      }

      // Continue with empty sources - we can still try to generate an answer
      sources = [];
    }

    // ========================================================================
    // STEP 2: ANSWER - Generate answer using LLM with sources (15% → 75%)
    // ========================================================================
    try {
      const answerStart = Date.now();
      console.log(`[${getTimestamp()}] [API] Starting answer generation phase...`);

      // Update progress: Starting answer generation
      if (jobId) {
        progressManager.updateProgress(jobId, 15, 'Linking neural networks', 'answer');
      }

      answer = await answerAgent(question, sources);
      answerLatencyMs = Date.now() - answerStart;

      // Update progress: Answer complete
      if (jobId) {
        progressManager.updateProgress(jobId, 75, 'Answer complete', 'answer');
      }

      console.log(`[${getTimestamp()}] [API] ✓ Answer generation complete`);
      console.log(`[${getTimestamp()}] [API]   - Answer length: ${answer.text.length} characters`);
      console.log(`[${getTimestamp()}] [API]   - Blocks generated: ${answer.blocks.length}`);
      console.log(`[${getTimestamp()}] [API]   - Answer latency: ${answerLatencyMs}ms`);

      if (answer.blocks.length === 0) {
        console.log(`[${getTimestamp()}] [API] ⚠ Warning: Answer has no blocks`);
        errors.push('Answer has no blocks');
      }
    } catch (error) {
      answerLatencyMs = Date.now() - requestStart - retrievalLatencyMs;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${getTimestamp()}] [API] ✗ Answer generation failed: ${errorMsg}`);
      errors.push(`Answer generation failed: ${errorMsg}`);

      // Update progress even on failure
      if (jobId) {
        progressManager.updateProgress(jobId, 75, 'Answer complete (degraded)', 'answer');
      }

      // Use fallback answer
      answer = createFallbackAnswer(errorMsg);
      console.log(`[${getTimestamp()}] [API] Using fallback answer`);
    }

    // ========================================================================
    // STEP 3: BUILD EVIDENCE GRAPH (with L3 + semantic edges) (75% → 100%)
    // ========================================================================
    try {
      const graphStart = Date.now();
      console.log(`[${getTimestamp()}] [API] Building evidence graph...`);

      // Update progress: Starting graph building
      if (jobId) {
        progressManager.updateProgress(jobId, 75, 'Materializing thoughts', 'graph');
      }

      evidenceGraph = await buildEvidenceGraph(question, answer, sources, densityLevel);
      graphLatencyMs = Date.now() - graphStart;

      // Update progress: Graph complete
      if (jobId) {
        progressManager.updateProgress(jobId, 100, 'Ready', 'complete');
      }

      console.log(`[${getTimestamp()}] [API] ✓ Evidence graph built`);
      console.log(`[${getTimestamp()}] [API]   - Total nodes: ${evidenceGraph.nodes.length}`);
      console.log(`[${getTimestamp()}] [API]   - Total edges: ${evidenceGraph.edges.length}`);
      console.log(`[${getTimestamp()}] [API]   - Nodes by layer:`);

      // Log nodes by layer
      if (evidenceGraph.metadata?.nodesByLayer) {
        const layerCounts = evidenceGraph.metadata.nodesByLayer as Record<number, number>;
        console.log(`[${getTimestamp()}] [API]     • Layer 0 (center): ${layerCounts[0] || 0}`);
        console.log(`[${getTimestamp()}] [API]     • Layer 1 (blocks): ${layerCounts[1] || 0}`);
        console.log(`[${getTimestamp()}] [API]     • Layer 2 (direct sources): ${layerCounts[2] || 0}`);
        console.log(`[${getTimestamp()}] [API]     • Layer 3 (secondary sources): ${layerCounts[3] || 0}`);
      }

      console.log(`[${getTimestamp()}] [API]   - Graph nodes by type:`);

      // Count nodes by type for detailed logging
      const nodeCounts = evidenceGraph.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(nodeCounts).forEach(([type, count]) => {
        console.log(`[${getTimestamp()}] [API]     • ${type}: ${count}`);
      });

      // Count edges by relation
      const edgeCounts = evidenceGraph.edges.reduce((acc, edge) => {
        acc[edge.relation] = (acc[edge.relation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`[${getTimestamp()}] [API]   - Edges by relation:`);
      Object.entries(edgeCounts).forEach(([relation, count]) => {
        console.log(`[${getTimestamp()}] [API]     • ${relation}: ${count}`);
      });

      console.log(`[${getTimestamp()}] [API]   - Graph latency: ${graphLatencyMs}ms`);
    } catch (error) {
      graphLatencyMs = Date.now() - requestStart - retrievalLatencyMs - answerLatencyMs;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${getTimestamp()}] [API] ✗ Graph building failed: ${errorMsg}`);
      errors.push(`Graph building failed: ${errorMsg}`);

      // Update progress even on failure
      if (jobId) {
        progressManager.updateProgress(jobId, 100, 'Ready (degraded)', 'complete');
      }

      // Use minimal graph
      evidenceGraph = createMinimalGraph(question);
      console.log(`[${getTimestamp()}] [API] Using minimal graph (question node only)`);
    }

    // ========================================================================
    // BUILD AND SEND RESPONSE
    // ========================================================================
    const totalLatencyMs = Date.now() - requestStart;

    console.log(`[${getTimestamp()}] [API] ========================================`);
    console.log(`[${getTimestamp()}] [API] Request complete`);
    console.log(`[${getTimestamp()}] [API]   - Total latency: ${totalLatencyMs}ms`);
    console.log(`[${getTimestamp()}] [API]   - Breakdown:`);
    console.log(`[${getTimestamp()}] [API]     • Retrieval: ${retrievalLatencyMs}ms (${((retrievalLatencyMs/totalLatencyMs)*100).toFixed(1)}%)`);
    console.log(`[${getTimestamp()}] [API]     • Answer: ${answerLatencyMs}ms (${((answerLatencyMs/totalLatencyMs)*100).toFixed(1)}%)`);
    console.log(`[${getTimestamp()}] [API]     • Graph: ${graphLatencyMs}ms (${((graphLatencyMs/totalLatencyMs)*100).toFixed(1)}%)`);

    if (errors.length > 0) {
      console.log(`[${getTimestamp()}] [API]   - Errors encountered: ${errors.length}`);
      errors.forEach((err, idx) => {
        console.log(`[${getTimestamp()}] [API]     ${idx + 1}. ${err}`);
      });
    }

    console.log(`[${getTimestamp()}] [API] ========================================\n`);

    const response: AnswerResponse = {
      question,
      answer,
      sources,
      evidence_graph: evidenceGraph,
      meta: {
        model: 'gpt-4o-mini',
        retrieval_latency_ms: retrievalLatencyMs,
        answer_latency_ms: answerLatencyMs,
        graph_latency_ms: graphLatencyMs,
        total_latency_ms: totalLatencyMs,
        ...(errors.length > 0 && {
          degraded: true,
          errors: errors
        })
      }
    };

    res.json(response);

  } catch (error) {
    // ========================================================================
    // CATASTROPHIC ERROR HANDLER (should never reach here)
    // ========================================================================
    const totalLatencyMs = Date.now() - requestStart;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[${getTimestamp()}] [API] ========================================`);
    console.error(`[${getTimestamp()}] [API] ✗ CATASTROPHIC ERROR`);
    console.error(`[${getTimestamp()}] [API] ${errorMsg}`);
    if (error instanceof Error && error.stack) {
      console.error(`[${getTimestamp()}] [API] Stack trace:`);
      console.error(error.stack);
    }
    console.error(`[${getTimestamp()}] [API] ========================================\n`);

    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMsg,
      meta: {
        total_latency_ms: totalLatencyMs,
        catastrophic_failure: true
      }
    });
  }
}

/**
 * Registers the answer route with the Express app
 */
export function registerAnswerRoute(app: Express): void {
  app.post('/api/answer', handleAnswer);
  console.log('[Routes] Registered POST /api/answer');
}
