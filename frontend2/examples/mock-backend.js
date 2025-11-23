/**
 * Simple mock backend server for testing the AI Reasoning Graph frontend
 * Run with: node examples/mock-backend.js
 * Then start the frontend with: npm run dev
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;

const exampleResponse = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'example-response.json'), 'utf8')
);

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST to /api/ask
  if (req.method === 'POST' && req.url === '/api/ask') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { question } = JSON.parse(body);
        console.log(`Question received: ${question}`);
        
        // Simulate processing delay
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(exampleResponse));
          console.log('Response sent');
        }, 1000);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
  console.log('Waiting for requests...');
});
