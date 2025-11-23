import { ReasoningResponse } from '../types';

/**
 * Configuration for the API client
 */
const API_CONFIG = {
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000, // 60 seconds
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Ask a question and get a reasoning response with evidence graph
 *
 * @param question - The question to ask
 * @param jobId - Optional job ID for progress tracking
 * @returns Promise with the reasoning response including evidence graph
 * @throws ApiError if the request fails
 */
export async function askQuestion(question: string, jobId?: string): Promise<ReasoningResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    // Append jobId as query param if provided
    const url = jobId
      ? `${API_CONFIG.baseUrl}/api/answer?jobId=${encodeURIComponent(jobId)}`
      : `${API_CONFIG.baseUrl}/api/answer`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data: ReasoningResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout - the server took too long to respond');
      }
      throw new ApiError(`Network error: ${error.message}`);
    }

    throw new ApiError('An unknown error occurred');
  }
}

/**
 * Check if the API is available
 *
 * @returns Promise<boolean> true if the API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
