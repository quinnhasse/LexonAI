/**
 * Answer Route Handler
 * Exposes POST /api/answer endpoint for answering questions with evidence
 */

import { Request, Response, Express } from 'express';
import { researchAgent } from '../services/researchAgent';
import { answerAgent } from '../services/answerAgent';
import { buildEvidenceGraph } from '../services/evidenceGraph';
import { AnswerResponse } from '../types/shared';

interface AnswerRequest {
  question: string;
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
 * - evidence_graph: graph connecting question -> blocks -> sources
 * - meta: timing and model information
 */
async function handleAnswer(req: Request, res: Response): Promise<void> {
  try {
    const { question } = req.body as AnswerRequest;

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Question must be a non-empty string'
      });
      return;
    }

    console.log(`\n[API] Received question: "${question}"`);

    // Step 1: Research - Get sources using Exa
    const retrievalStart = Date.now();
    const sources = await researchAgent(question);
    const retrievalLatencyMs = Date.now() - retrievalStart;
    console.log(`[API] Retrieved ${sources.length} sources in ${retrievalLatencyMs}ms`);

    // Step 2: Answer - Generate answer using LLM with sources
    const answerStart = Date.now();
    const answer = await answerAgent(question, sources);
    const answerLatencyMs = Date.now() - answerStart;
    console.log(`[API] Generated answer with ${answer.blocks.length} blocks in ${answerLatencyMs}ms`);

    // Step 3: Build evidence graph
    const evidenceGraph = buildEvidenceGraph(question, answer, sources);
    console.log(`[API] Built evidence graph with ${evidenceGraph.nodes.length} nodes and ${evidenceGraph.edges.length} edges`);

    // Build response
    const response: AnswerResponse = {
      question,
      answer,
      sources,
      evidence_graph: evidenceGraph,
      meta: {
        model: 'stub-llm-v1',  // TODO: Update with actual model name when LLM is integrated
        retrieval_latency_ms: retrievalLatencyMs,
        answer_latency_ms: answerLatencyMs,
        total_latency_ms: retrievalLatencyMs + answerLatencyMs
      }
    };

    res.json(response);
  } catch (error) {
    console.error('[API] Error processing request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
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
