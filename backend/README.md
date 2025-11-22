# Transparens AI - Backend

Backend API server for Transparens AI, providing transparent AI answers with evidence graphs.

## Architecture

The backend implements a clean separation between:

1. **Research Agent** (`services/researchAgent.ts`) - Uses Exa API to fetch relevant sources
2. **Answer Agent** (`services/answerAgent.ts`) - Uses LLM to generate answers ONLY from provided sources
3. **Evidence Graph Builder** (`services/evidenceGraph.ts`) - Constructs a graph linking questions → answer blocks → sources

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
EXA_API_KEY=your_exa_api_key_here
LLM_API_KEY=your_llm_api_key_here
PORT=3001
NODE_ENV=development
```

**Required API Keys:**
- `EXA_API_KEY` - Get from [Exa](https://exa.ai/)
- `LLM_API_KEY` - OpenAI or Anthropic API key (implementation pending)

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Type checking:
```bash
npm run type-check
```

## API Endpoints

### POST /api/answer

Ask a question and receive a structured answer with sources and evidence graph.

**Request:**
```json
{
  "question": "What is AI transparency?"
}
```

**Response:**
```json
{
  "question": "What is AI transparency?",
  "answer": {
    "text": "Full answer text...",
    "blocks": [
      {
        "id": "ans-1",
        "type": "paragraph",
        "text": "AI transparency refers to...",
        "source_ids": ["s1", "s3"]
      }
    ]
  },
  "sources": [
    {
      "id": "s1",
      "title": "Source Title",
      "url": "https://example.com",
      "snippet": "Relevant excerpt...",
      "score": 0.95
    }
  ],
  "evidence_graph": {
    "nodes": [
      { "id": "q", "type": "question", "label": "What is AI transparency?" },
      { "id": "ans-1", "type": "answer_block", "label": "AI transparency refers to..." },
      { "id": "s1", "type": "source", "label": "Source Title" }
    ],
    "edges": [
      { "from": "q", "to": "ans-1", "relation": "answers" },
      { "from": "ans-1", "to": "s1", "relation": "supports" }
    ]
  },
  "meta": {
    "model": "stub-llm-v1",
    "retrieval_latency_ms": 500,
    "answer_latency_ms": 800,
    "total_latency_ms": 1300
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T12:00:00.000Z",
  "environment": "development"
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── config/
│   │   └── env.ts            # Environment configuration
│   ├── routes/
│   │   └── answerRoute.ts    # /api/answer endpoint
│   ├── services/
│   │   ├── researchAgent.ts  # Exa-based source retrieval
│   │   ├── answerAgent.ts    # LLM-based answer generation
│   │   └── evidenceGraph.ts  # Evidence graph builder
│   └── types/
│       └── shared.ts         # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Current Status

### ✅ Implemented
- Complete TypeScript type system
- Express server with CORS and logging
- Stub implementations for all agents
- Evidence graph generation
- Full API endpoint structure

### 🚧 TODO (marked in code)
- Exa API integration in `researchAgent.ts`
- LLM integration in `answerAgent.ts`
- Error handling improvements
- Rate limiting
- Caching layer
- Testing suite

## Development Notes

The current implementation uses stub data to allow end-to-end testing without API keys. Search for `TODO` comments in the code to find integration points for:
- Exa API calls
- LLM API calls
- Production error handling
- Performance optimizations
