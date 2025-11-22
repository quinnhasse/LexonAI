# Transparens AI

**Transparent AI answers with verifiable evidence.**

Transparens AI is a system that provides AI-generated answers with complete transparency and source attribution. Unlike traditional AI systems that act as "black boxes," Transparens AI separates the research and answer generation processes, providing users with:

- **Structured answers** broken into clear, logical blocks
- **Direct source citations** for every claim
- **Evidence graphs** that visualize the relationship between questions, answers, and sources
- **Full transparency** into how answers are constructed

## System Architecture

### Overview

```
User Question
    ↓
Research Agent (Exa) → Retrieves relevant sources
    ↓
Answer Agent (LLM) → Generates answer ONLY using those sources
    ↓
Evidence Graph Builder → Links question → answer blocks → sources
    ↓
JSON Response → Frontend visualization
```

### Key Design Principles

1. **Separation of Concerns**: Research and answer generation are separate, independent processes
2. **Source Constraint**: The LLM can ONLY use information from retrieved sources
3. **Structured Output**: Answers are broken into blocks (paragraphs/bullets) with explicit source citations
4. **Transparency**: Every claim is traceable to its source via the evidence graph

## Repository Structure

```
MadHacks2025/
├── backend/              # Node.js/TypeScript API server
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Core business logic
│   │   │   ├── researchAgent.ts  # Exa-based RAG
│   │   │   ├── answerAgent.ts    # LLM answer generation
│   │   │   └── evidenceGraph.ts  # Graph construction
│   │   ├── types/                # TypeScript definitions
│   │   └── config/               # Environment config
│   └── README.md
│
└── frontend/             # (Empty - future React/Viz app)
    └── .gitkeep
```

## Tech Stack

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express
- **RAG Provider**: Exa (for source retrieval)
- **LLM**: TBD (OpenAI/Claude via stub interface)

### Frontend (Planned)
- Will render:
  - Answer blocks with inline citations
  - Source cards with URLs and excerpts
  - Interactive evidence graph visualization

## Getting Started

### Backend Setup

See [backend/README.md](backend/README.md) for detailed instructions.

Quick start:
```bash
cd backend
npm install
cp .env.example .env  # Add your API keys
npm run dev
```

The server will start on `http://localhost:3001`

### API Example

```bash
curl -X POST http://localhost:3001/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "What is AI transparency?"}'
```

## Current Status

### ✅ Completed
- Backend scaffolding with TypeScript
- Type system for all data structures
- Stub implementations for research/answer agents
- Evidence graph builder
- Working API endpoint with mock data

### 🚧 Next Steps
1. Integrate Exa API for real source retrieval
2. Integrate LLM API for answer generation
3. Build frontend visualization
4. Add caching and optimization
5. Deploy to production

## Development

This project was built for a hackathon with the goal of making AI more transparent and trustworthy. The focus is on:
- Clean architecture that separates concerns
- Type-safe implementation
- Clear documentation of data flow
- Extensible design for future enhancements

## License

MIT
