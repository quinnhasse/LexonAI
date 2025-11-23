  Our backend implements a RAG (Retrieval-Augmented Generation) pipeline with transparent evidence tracking. Here's the flow:

  🔄 Three-Phase Pipeline

  1. Research Phase (researchAgent.ts:*)
  - Uses Exa API to search the web for relevant sources
  - Retrieves 6-12 sources (based on density setting) with full text and highlights
  - No database—fresh web data per request

  2. Answer Generation (answerAgent.ts:*)
  - Sends sources to OpenAI GPT-4o-mini
  - LLM generates structured answer blocks with explicit source citations
  - Strict validation: only uses provided sources (no hallucination)

  3. Knowledge Graph Construction (evidenceGraph.ts:*)
  - Layer 0: Question + answer root nodes
  - Layer 1: Answer blocks (conceptual branches)
  - Layer 2: Direct sources cited by blocks
  - Layer 3: Secondary concepts extracted via GPT-4o-mini (secondarySourceAgent.ts:*)
  - Semantic edges: Built using OpenAI embeddings to connect related nodes (semanticGraphBuilder.ts:*)

  🌐 External APIs Used

  1. Exa API - Web search & content retrieval
  2. OpenAI GPT-4o-mini - Answer generation & concept extraction
  3. OpenAI Embeddings - Semantic similarity for graph edges

  🎚️ Density Levels

  Configurable complexity (density.ts:*):
  - Low: 6 sources, 15 concepts, 40 edges (fast)
  - Medium: 10 sources, 30 concepts, 80 edges (default)
  - High: 12 sources, 40 concepts, 120 edges (rich)

  🛡️ Reliability

  Every stage has fallback strategies—system never crashes, always returns a response even if parts fail (graceful degradation).
