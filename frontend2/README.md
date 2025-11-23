# AI Reasoning Graph Visualization

An interactive 3D visualization tool that shows how an AI forms answers by connecting knowledge sources through reasoning blocks.

## Features

- **3-Layer Hierarchical Graph**: Visualize the answer formation process
  - **Answer Node** (center) - The final answer
  - **Block Nodes** (middle layer) - Reasoning steps that support the answer
  - **Source Nodes** (outer layer) - Original knowledge sources
- **Interactive 3D Visualization**: Rotate, zoom, and explore the reasoning graph
- **Node Details**: Click any node to view full content and metadata
- **Dark Mode**: Beautiful dark interface optimized for extended viewing
- **Real-time Graph**: See the complete reasoning structure instantly

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Three.js** via react-three-fiber for 3D visualization
- **@react-three/drei** for useful Three.js helpers

### Backend API Structure
The frontend expects a backend API at `http://localhost:8000/api/ask` that:

**Request:**
```json
{
  "question": "What is AI transparency?"
}
```

**Response:**
```json
{
  "question": "string",
  "answer": {
    "text": "Full answer text...",
    "blocks": [
      {
        "id": "ans-1",
        "type": "paragraph" | "bullet",
        "text": "Reasoning block text...",
        "source_ids": ["s1", "s2"]
      }
    ]
  },
  "sources": [
    {
      "id": "s1",
      "title": "Article title",
      "url": "https://...",
      "snippet": "Short excerpt...",
      "full_text": "Complete article text...",
      "score": 0.95,
      "metadata": {
        "provider": "source name",
        "published_date": "2024-01-01",
        "author": "Author Name"
      }
    }
  ]
}
```

## Getting Started

### Installation

```bash
npm install
```

### Development with Mock Backend (for testing)

```bash
# Terminal 1: Start the mock backend
node examples/mock-backend.js

# Terminal 2: Start the frontend
npm run dev
```

The app will start on `http://localhost:3000` and connect to the mock backend at `http://localhost:8000`

Try asking: **"What is AI transparency?"** to see the example visualization.

### Development with Real Backend

```bash
npm run dev
```

Make sure your backend is running at `http://localhost:8000/api/ask`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How It Works

### 1. User Input
User types a question in the input field at the bottom

### 2. Backend Processing
- Question is sent to the backend
- Backend retrieves relevant sources (using RAG/vector search)
- LLM creates reasoning blocks that synthesize the sources
- Final answer is generated from the reasoning blocks

### 3. Visualization
- **Answer Node** (green, center, largest) - Contains the final answer
- **Block Nodes** (blue, middle) - Reasoning steps, connected to answer
- **Source Nodes** (purple, outer) - Original sources, connected to blocks

### 4. Exploration
- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag
- **Zoom**: Scroll wheel
- **Details**: Click any node to see full content

## Node Types

### Answer Node
- **Color**: Green
- **Size**: Largest (radius 1.5)
- **Position**: Center of graph
- **Contains**: Full answer text
- **Connections**: Receives edges from all reasoning blocks

### Block Nodes
- **Color**: Blue
- **Size**: Medium (radius 0.8)
- **Position**: Circle around answer node
- **Contains**: Reasoning text that supports the answer
- **Connections**: 
  - Connects TO answer node
  - Receives FROM source nodes

### Source Nodes
- **Color**: Purple
- **Size**: Smallest (radius 0.5)
- **Position**: Outer layer
- **Contains**: Original source material (articles, documents)
- **Connections**: Connects TO block nodes that reference them

## Project Structure

```
src/
├── components/
│   ├── GraphVisualization.tsx  # Main 3D canvas and scene
│   ├── Node.tsx                # 3D sphere for each node type
│   ├── Edge.tsx                # Lines connecting nodes
│   ├── NodeDetailPanel.tsx     # Modal showing node details
│   └── QuestionInput.tsx       # Input field for questions
├── utils/
│   ├── graphTransform.ts       # Transform API response to graph
│   └── graphLayout.ts          # Calculate node positions
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## Backend Requirements

To build a compatible backend, implement these steps:

1. **Receive Question**: POST endpoint `/api/ask`
2. **Retrieve Sources**: Use vector search/RAG to find relevant documents
3. **Generate Reasoning Blocks**: 
   - Use LLM to create intermediate reasoning steps
   - Each block references which sources it uses (`source_ids`)
   - Blocks can be paragraphs or bullet points
4. **Generate Answer**: 
   - Create final answer that synthesizes the blocks
5. **Return JSON**: Use the response format shown above

### Recommended Stack
- **Database**: Supabase with pgvector extension
- **Embeddings**: OpenAI Embeddings API
- **RAG/Search**: Tavily API, Exa API, or custom vector search
- **LLM**: GPT-4, Claude, or similar with structured output

### Example LLM Prompt Structure
```
You are analyzing sources to answer a question.

Question: {question}

Sources:
1. [s1] {source 1 text}
2. [s2] {source 2 text}
...

Task:
1. Create 2-4 reasoning blocks that synthesize these sources
2. For each block, specify which source IDs it uses
3. Generate a final answer based on the blocks
4. Return as JSON with the specified structure
```

## Controls

- **Left Click + Drag**: Rotate the graph
- **Right Click + Drag**: Pan the view
- **Scroll**: Zoom in/out
- **Click Node**: View detailed information
- **Hover Answer Node**: See preview of answer text

## Customization

### Change Colors

Edit `src/components/Node.tsx`:

```typescript
const nodeTypeConfig = {
  answer: { color: '#10b981', ... },  // Green
  block: { color: '#60a5fa', ... },   // Blue
  source: { color: '#a78bfa', ... },  // Purple
}
```

### Adjust Layout

Edit `src/utils/graphLayout.ts`:

```typescript
const blockRadius = 8;   // Distance of blocks from center
const sourceRadius = 16; // Distance of sources from center
```

### Node Sizes

Edit `src/components/Node.tsx`:

```typescript
const nodeTypeConfig = {
  answer: { radius: 1.5, ... },
  block: { radius: 0.8, ... },
  source: { radius: 0.5, ... },
}
```

## Future Enhancements

- [ ] Animated node appearance (fade in)
- [ ] Filter by node type (show/hide sources, blocks)
- [ ] Search within graph
- [ ] Export graph as image
- [ ] Different layout algorithms (force-directed, tree, etc.)
- [ ] Streaming answer generation
- [ ] Multiple question sessions (graph history)

## License

MIT
