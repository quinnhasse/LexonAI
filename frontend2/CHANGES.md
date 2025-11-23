# Changes Made to AI Reasoning Graph Frontend

## Summary

The frontend has been completely restructured to match the new 3-layer hierarchical graph architecture where the answer appears as a node in the center, rather than in a side panel.

## Major Changes

### 1. New Graph Architecture

**Before:**
- Nodes represented knowledge chunks (principles, facts, examples, etc.)
- Answer displayed in a separate side panel
- Step-by-step animation system

**After:**
- **Answer Node** (center) - Contains the final answer text
- **Block Nodes** (middle layer) - Reasoning blocks that support the answer
- **Source Nodes** (outer layer) - Original source documents
- All information visible in the graph itself
- No separate answer panel

### 2. API Response Structure

**New Format:**
```json
{
  "question": "string",
  "answer": {
    "text": "Full answer text",
    "blocks": [
      {
        "id": "ans-1",
        "type": "paragraph" | "bullet",
        "text": "Reasoning block text",
        "source_ids": ["s1", "s2"]
      }
    ]
  },
  "sources": [
    {
      "id": "s1",
      "title": "Source title",
      "url": "https://...",
      "snippet": "Excerpt",
      "full_text": "Complete text",
      "score": 0.95,
      "metadata": {...}
    }
  ]
}
```

### 3. Files Changed

#### Created:
- `src/utils/graphTransform.ts` - Transforms API response to graph nodes/edges
- `src/utils/graphLayout.ts` - Calculates hierarchical node positions
- `examples/example-response.json` - New example with AI transparency question

#### Modified:
- `src/types/index.ts` - New type system (AnswerNode, BlockNode, SourceNode)
- `src/components/Node.tsx` - Support for 3 node types with different sizes/colors
- `src/components/GraphVisualization.tsx` - Uses hierarchical layout
- `src/components/NodeDetailPanel.tsx` - Shows different info per node type
- `src/App.tsx` - New data flow using graph transformation
- `examples/mock-backend.js` - Updated to return new response format

#### Deleted:
- `src/components/AnswerDisplay.tsx` - No longer needed
- `src/components/AnswerDisplay.css` - No longer needed

### 4. Visual Changes

**Node Appearance:**
- **Answer Node**: Green, radius 1.5, center position
- **Block Nodes**: Blue, radius 0.8, circle around answer
- **Source Nodes**: Purple, radius 0.5, outer layer

**Layout:**
- Answer at origin (0, 0, 0)
- Blocks at radius 8 from center
- Sources at radius 16 from center
- Hierarchical instead of sphere distribution

### 5. Interaction Changes

**Before:**
- Answer text appeared in top-right panel
- Step-by-step animation over time
- Nodes highlighted as answer progressed

**After:**
- Answer visible immediately in center node
- Hover over answer node to see preview
- Click any node for full details
- All nodes highlighted after loading

### 6. Data Flow

**New Flow:**
```
User Question
  ↓
Backend API (/api/ask)
  ↓
ReasoningResponse (raw JSON)
  ↓
transformResponseToGraph()
  ↓
{nodes: Node[], edges: Edge[]}
  ↓
calculateHierarchicalLayout()
  ↓
Positioned nodes with [x, y, z]
  ↓
3D Visualization
```

## Backend Requirements

Your backend must now:

1. Accept POST requests with `{ "question": "..." }`
2. Return response in new format (see API Response Structure above)
3. Create reasoning blocks that reference sources
4. Maintain IDs for proper graph connections

## Migration Notes

If you had a backend using the old format:

1. Change from `nodes` array to `answer` + `sources` structure
2. Replace `role` field with `type` field
3. Add `blocks` array to link sources to answer
4. Include `source_ids` in each block
5. Update `edges` to connect sources→blocks→answer

## Testing

To test the new structure:

```bash
# Terminal 1
node examples/mock-backend.js

# Terminal 2
npm run dev

# Browser
http://localhost:3000
Ask: "What is AI transparency?"
```

You should see:
- 1 green answer node in center
- 3 blue block nodes around it
- 4 purple source nodes on the outside
- Lines connecting sources→blocks→answer

## Color Coding

- **Green** = Answer (final synthesis)
- **Blue** = Blocks (reasoning steps)
- **Purple** = Sources (original documents)

This matches the information hierarchy:
Raw Data (Purple) → Reasoning (Blue) → Answer (Green)
