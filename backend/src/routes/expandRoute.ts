import { Request, Response, Express } from 'express';
import { expandReasoning } from '../services/reasoningExpander.js';

interface ExpandRequest {
  title: string;
  reasoning: string;
}

interface ExpandResponse {
  title: string;
  expandedReasoning: string;
  meta: {
    model: string;
    latency_ms: number;
  };
}

async function handleExpand(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const { title, reasoning } = req.body as ExpandRequest;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      error: 'Title must be a non-empty string'
    });
    return;
  }

  if (!reasoning || typeof reasoning !== 'string' || reasoning.trim().length === 0) {
    res.status(400).json({
      error: 'Reasoning must be a non-empty string'
    });
    return;
  }

  try {
    console.log(`[ExpandRoute] Expanding reasoning for title: "${title}"`);
    const expanded = await expandReasoning(title.trim(), reasoning.trim());
    const latencyMs = Date.now() - startTime;

    const response: ExpandResponse = {
      title: title.trim(),
      expandedReasoning: expanded,
      meta: {
        model: 'gpt-4o-mini',
        latency_ms: latencyMs,
      }
    };

    res.json(response);
  } catch (error) {
    console.error('[ExpandRoute] Failed to expand reasoning', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal Server Error',
      message,
      meta: {
        latency_ms: Date.now() - startTime,
        failed: true,
      }
    });
  }
}

export function registerExpandRoute(app: Express): void {
  app.post('/expand', handleExpand);
  console.log('[Routes] Registered POST /expand');
}
