/**
 * Progress Manager
 *
 * Manages progress state for long-running query operations.
 * Uses in-memory storage with automatic cleanup.
 */

export interface ProgressState {
  progress: number;      // 0-100
  status: string;        // Human-readable status message
  phase: string;         // Current phase: 'research' | 'answer' | 'graph' | 'complete'
  createdAt: number;     // Timestamp for cleanup
}

class ProgressManager {
  private jobs: Map<string, ProgressState>;
  private cleanupInterval: NodeJS.Timeout | null;
  private readonly CLEANUP_AFTER_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

  constructor() {
    this.jobs = new Map();
    this.cleanupInterval = null;
    this.startCleanupInterval();
  }

  /**
   * Create a new job with initial progress state
   */
  createJob(jobId: string): void {
    this.jobs.set(jobId, {
      progress: 0,
      status: 'Starting...',
      phase: 'init',
      createdAt: Date.now()
    });
    console.log(`[ProgressManager] Created job: ${jobId}`);
  }

  /**
   * Update progress for an existing job
   */
  updateProgress(jobId: string, progress: number, status: string, phase: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[ProgressManager] Job not found: ${jobId}`);
      return;
    }

    // Ensure progress is monotonic (never decreases)
    const newProgress = Math.max(job.progress, Math.min(100, progress));

    this.jobs.set(jobId, {
      progress: newProgress,
      status,
      phase,
      createdAt: job.createdAt
    });

    console.log(`[ProgressManager] Updated job ${jobId}: ${newProgress}% - ${status}`);
  }

  /**
   * Get current progress state for a job
   */
  getProgress(jobId: string): ProgressState | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Mark a job as complete (100%) and schedule for cleanup
   */
  completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[ProgressManager] Cannot complete - job not found: ${jobId}`);
      return;
    }

    this.jobs.set(jobId, {
      progress: 100,
      status: 'Ready',
      phase: 'complete',
      createdAt: job.createdAt
    });

    console.log(`[ProgressManager] Completed job: ${jobId}`);
  }

  /**
   * Remove a job from tracking (immediate cleanup)
   */
  removeJob(jobId: string): void {
    if (this.jobs.delete(jobId)) {
      console.log(`[ProgressManager] Removed job: ${jobId}`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, this.CLEANUP_CHECK_INTERVAL_MS);
  }

  /**
   * Remove jobs older than CLEANUP_AFTER_MS
   */
  private cleanupOldJobs(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt > this.CLEANUP_AFTER_MS) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[ProgressManager] Cleaned up ${cleanedCount} old job(s)`);
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    console.log('[ProgressManager] Shutdown complete');
  }

  /**
   * Get current number of active jobs (for monitoring)
   */
  getActiveJobCount(): number {
    return this.jobs.size;
  }
}

// Singleton instance
export const progressManager = new ProgressManager();
