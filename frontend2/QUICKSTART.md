# Quick Start Guide

Get the AI Reasoning Graph visualization running in 2 minutes.

## Prerequisites

- Node.js 18+ installed
- npm package manager

## Installation & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock backend (Terminal 1)

```bash
node examples/mock-backend.js
```

You should see:
```
Mock backend running at http://localhost:8000
Waiting for requests...
```

### 3. Start the frontend (Terminal 2)

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### 4. Open your browser

Navigate to `http://localhost:3000`

### 5. Ask a question

In the input box at the bottom, type:
```
What is AI transparency?
```

Click the send button (arrow icon) and watch the graph appear!

## What You'll See

The 3D graph shows three layers:

1. **Center (Green)**: Answer node - the final answer
2. **Middle (Blue)**: Block nodes - reasoning steps
3. **Outer (Purple)**: Source nodes - original articles/documents

**Lines show connections:**
- Sources → Blocks (which blocks use which sources)
- Blocks → Answer (which reasoning supports the answer)

## Controls

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag
- **Zoom**: Scroll wheel
- **Node Details**: Click on any node

## Graph Structure Example

```
        [Source: Zendesk Article]
                 ↓
         [Block: Black Box Analogy]
                 ↓
            [Answer Node] ← [Block: Ethical Values]
                 ↑               ↑
         [Block: Governance]     |
                 ↑               |
        [Source: IBM Article] [Source: GeeksforGeeks]
```

## Building Your Own Backend

The mock backend returns a fixed response. To build a real backend:

1. **Create an API endpoint**: `POST /api/ask`
2. **Retrieve sources**: Use RAG/vector search
3. **Generate reasoning blocks**: Use an LLM to synthesize sources
4. **Return JSON**: Follow the structure in `examples/example-response.json`

See the main README.md for the complete API specification.

## Troubleshooting

**"Failed to fetch" error**
- Make sure mock backend is running: `node examples/mock-backend.js`
- Check it's on port 8000 (should see message in terminal)

**Nothing appears after asking question**
- Check browser console (F12) for errors
- Verify mock backend terminal shows "Question received: ..."
- Try refreshing the page

**Graph looks weird**
- Try zooming out (scroll)
- Click and drag to rotate the view
- The answer node (green) should be in the center

**TypeScript errors**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Next Steps

- Read README.md for full documentation
- Modify `examples/example-response.json` to test different graphs
- Build a real backend that integrates with your knowledge base
- Customize colors and layout in the code

Enjoy exploring AI reasoning graphs!
