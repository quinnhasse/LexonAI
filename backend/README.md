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
- `LLM_API_KEY` - OpenAI API key for answer generation (get from [OpenAI](https://platform.openai.com/api-keys))

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

Testing the research agent:
```bash
npm run test:research
```

Testing the answer agent:
```bash
npm run test:answer
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
    "model": "gpt-4o-mini",
    "retrieval_latency_ms": 500,
    "answer_latency_ms": 2500,
    "total_latency_ms": 3000
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

### ✅ Phase 1: Project Setup (Complete)
- Complete TypeScript type system
- Express server with CORS and logging
- Full API endpoint structure
- Evidence graph generation

### ✅ Phase 2: Exa Research Agent (Complete)
- **Full Exa API integration** in `researchAgent.ts`
- Optimized for RAG use cases with:
  - 5 high-quality sources per query
  - Full text content (up to 10,000 characters)
  - Highlights/snippets (3 sentences, 5 per URL)
  - Relevance scoring
- Graceful error handling with stub fallback
- Safe API key management
- Test harness for unit testing (`npm run test:research`)
- Integration with `/api/answer` endpoint

### ✅ Phase 3: LLM Answer Agent (Complete)
- **Full OpenAI integration** in `answerAgent.ts`
- Answer generation ONLY from provided sources (no hallucination)
- Structured answer blocks with explicit source citations
- Comprehensive validation and error handling
- Uses GPT-4o-mini model for fast, cost-effective responses
- JSON mode for guaranteed structured output
- Retry logic with exponential backoff
- Graceful fallback when LLM unavailable
- Test harness for unit testing (`npm run test:answer`)

### 🚧 Future Enhancements
- Rate limiting
- Caching layer for repeated queries
- More comprehensive testing suite
- Performance optimizations

## Development Notes

### Exa Integration

The `researchAgent.ts` now includes full Exa API integration:

**Request Configuration:**
- Endpoint: `https://api.exa.ai/search`
- Authentication: `x-api-key` header
- Search parameters optimized for RAG:
  - `numResults: 5` - Quality over quantity
  - `type: 'auto'` - Let Exa choose best search method (neural vs deep)
  - `text.maxCharacters: 10000` - Full content for LLM context
  - `highlights` - Concise snippets for quick reference

**Error Handling:**
- Missing API key → Falls back to stub sources with warning
- Network errors → Falls back to stub sources with error log
- API errors → Parses error response and falls back gracefully

**Response Mapping:**
- Maps Exa results to `Source` type
- Generates sequential IDs (`s1`, `s2`, etc.)
- Extracts snippets from highlights or text preview
- Preserves metadata (published date, author, scores, etc.)

### Testing

**Unit Testing:**
Run the research agent test harness:
```bash
npm run test:research
```

This tests the agent with multiple sample questions and validates:
- Source structure (id, title, url, snippet, score)
- API integration (if EXA_API_KEY is set)
- Stub fallback (if EXA_API_KEY is missing)
- Error handling

**Integration Testing:**
Test the full pipeline via the API:
```bash
# Start the server
npm run dev

# In another terminal, test with curl
curl -X POST http://localhost:3001/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Transparens AI?"}'
```

### Answer Agent Implementation

The Answer Agent (`answerAgent.ts`) uses OpenAI's GPT-4o-mini model to generate source-grounded answers:

**Key Features:**
1. **Source Grounding:** Answers ONLY use information from provided sources
2. **JSON Mode:** Uses OpenAI's `response_format: { type: "json_object" }` for guaranteed structure
3. **Prompt Engineering:**
   - System message establishes strict "no hallucination" rules
   - User message includes formatted sources with IDs, titles, URLs, and content
   - Clear JSON schema specification
4. **Validation:**
   - Validates answer structure (text, blocks, source_ids)
   - Verifies all source_ids reference actual sources
   - Filters out invalid source citations
5. **Error Handling:**
   - Retry logic (2 attempts) with exponential backoff
   - Fallback to safe stub answer on failure
   - Never crashes the /api/answer endpoint
6. **Performance:**
   - Smart source truncation (1000 chars per source)
   - Total context budget (30,000 chars)
   - Average latency: 2-6 seconds
   - Token usage: ~1,000-1,500 tokens per request

**Model Configuration:**
- Model: `gpt-4o-mini` (fast, cost-effective)
- Temperature: `0.3` (factual, deterministic)
- Max tokens: `3000` (sufficient for multi-block answers)

**Testing:**
Run the answer agent test suite:
```bash
npm run test:answer
```

This validates:
- Answer structure (AnswerPayload type)
- Source attribution (all source_ids are valid)
- Grounding (blocks cite actual sources)
- Error handling (empty sources, API failures)
