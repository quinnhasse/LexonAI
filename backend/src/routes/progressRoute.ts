/**
 * Progress Route
 *
 * Provides real-time progress updates for long-running query operations.
 * Frontend polls this endpoint to update loading overlay.
 */

import { Router, Request, Response } from 'express';
import { progressManager } from '../services/progressManager';

const router = Router();

/**
 * GET /api/progress/:jobId
 *
 * Returns current progress state for a job.
 *
 * Response:
 * - 200: { jobId, progress, status, phase }
 * - 404: { error: "Job not found" }
 */
router.get('/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const progressState = progressManager.getProgress(jobId);

  if (!progressState) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId,
    progress: progressState.progress,
    status: progressState.status,
    phase: progressState.phase
  });
});

export default router;
