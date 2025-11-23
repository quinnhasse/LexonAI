import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")  // relative to env.ts location
});

/**
 * Environment configuration loader
 * Reads environment variables for API keys and config
 */

export interface Config {
  exaApiKey: string;
  llmApiKey: string;
  llmModel: string;
  port: number;
  nodeEnv: string;
}

export function loadConfig(): Config {
  const cfg = {
    exaApiKey: process.env.EXA_API_KEY || '',
    llmApiKey: process.env.LLM_API_KEY || '',
    llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  };

  // Safe logging - never log API keys themselves
  if (!cfg.exaApiKey) {
    console.warn('[Config] Warning: EXA_API_KEY is not set');
  }
  if (!cfg.llmApiKey) {
    console.warn('[Config] Warning: LLM_API_KEY is not set');
  }

  return cfg;
}

// Export singleton config instance
export const config = loadConfig();
