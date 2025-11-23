/**
 * Transparens AI Backend Server
 * Main entry point for the Express API server
 */

import express from 'express';
import { config } from './config/env';
import { registerAnswerRoute } from './routes/answerRoute';
import progressRoute from './routes/progressRoute';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS middleware for development (allow frontend to call API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Register routes
registerAnswerRoute(app);
app.use('/api/progress', progressRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/answer',
      'GET /api/progress/:jobId'
    ]
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 Transparens AI Backend Server');
  console.log('=================================');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port: ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/api/answer`);
  console.log(`  GET  http://localhost:${PORT}/api/progress/:jobId`);
  console.log('\nConfiguration:');
  console.log(`  EXA_API_KEY: ${config.exaApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`  LLM_API_KEY: ${config.llmApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log('=================================\n');
});
