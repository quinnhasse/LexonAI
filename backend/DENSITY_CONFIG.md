# Density Configuration Guide

## Overview

The Transparens AI backend now supports configurable **density levels** that control the richness and complexity of the evidence graph. This allows you to tune the graph from minimal (fast, lightweight) to rich (comprehensive, detailed) based on question complexity and visualization needs.

---

## Density Levels

### **Low Density** (Fast, Lightweight)
Best for: Simple questions, quick responses, resource-constrained environments

```typescript
{
  exaNumResults: 6,                    // 6 sources from Exa
  directSourcesPerBlock: { min: 1, target: 2, max: 4 },
  secondarySources: {
    topSourcesToProcess: 3,            // Top 3 sources
    conceptsPerSource: 2,              // 2 concepts per source
    maxTotalConcepts: 15               // Max 15 secondary nodes
  },
  semanticEdges: {
    minSimilarity: 0.65,               // Higher threshold = fewer edges
    topK: 4,                           // 4 neighbors per node
    maxEdges: 40                       // Max 40 semantic edges
  }
}
```

**Typical Output:**
- Total nodes: ~20-25
- Total edges: ~40-60
- Layer 2: 6 direct sources
- Layer 3: ~6-9 secondary sources
- Semantic edges: ~25-35

---

### **Medium Density** (Balanced, Default)
Best for: Most questions, balanced performance and richness

```typescript
{
  exaNumResults: 10,                   // 10 sources from Exa
  directSourcesPerBlock: { min: 1, target: 4, max: 6 },
  secondarySources: {
    topSourcesToProcess: 5,            // Top 5 sources
    conceptsPerSource: 3,              // 3 concepts per source
    maxTotalConcepts: 30               // Max 30 secondary nodes
  },
  semanticEdges: {
    minSimilarity: 0.60,               // Moderate threshold
    topK: 6,                           // 6 neighbors per node
    maxEdges: 80                       // Max 80 semantic edges
  }
}
```

**Typical Output:**
- Total nodes: ~30-40
- Total edges: ~80-120
- Layer 2: 10 direct sources
- Layer 3: ~15-25 secondary sources
- Semantic edges: ~60-80

**Example ("What is AI transparency?"):**
```
Total Nodes: 31
Total Edges: 100
- Layer 0: 2 (answer_root, question)
- Layer 1: 4 (answer blocks)
- Layer 2: 10 (direct sources)
- Layer 3: 15 (secondary sources)

Edges by Relation:
- answers: 5
- supports: 10
- underpins: 15
- semantic_related: 70
```

---

### **High Density** (Rich, Comprehensive)
Best for: Complex multi-part questions, research-intensive queries, maximum detail

```typescript
{
  exaNumResults: 12,                   // 12 sources from Exa
  directSourcesPerBlock: { min: 1, target: 5, max: 8 },
  secondarySources: {
    topSourcesToProcess: 8,            // Top 8 sources
    conceptsPerSource: 4,              // 4 concepts per source
    maxTotalConcepts: 40               // Max 40 secondary nodes
  },
  semanticEdges: {
    minSimilarity: 0.55,               // Lower threshold = more edges
    topK: 8,                           // 8 neighbors per node
    maxEdges: 120                      // Max 120 semantic edges
  }
}
```

**Typical Output:**
- Total nodes: ~45-60
- Total edges: ~140-200
- Layer 2: 12 direct sources
- Layer 3: ~30-40 secondary sources
- Semantic edges: ~100-120

---

## Usage

### Default Behavior

By default, the system uses **medium density** for all questions:

```typescript
// In answerRoute.ts
const densityLevel: DensityLevel = DEFAULT_DENSITY; // 'medium'
```

### Manual Override

To use a specific density level:

```typescript
import { getDensityConfig } from './config/density';

// Use high density for complex question
const densityLevel = 'high';
const sources = await researchAgent(question, densityLevel);
const secondaryNodes = await secondarySourceAgent(question, answer, sources, densityLevel);
const semanticEdges = await semanticGraphBuilder(nodes, {}, densityLevel);
```

### Automatic Inference (Future Enhancement)

The system includes a heuristic function `inferDensityLevel()` that can automatically determine appropriate density based on:

```typescript
import { inferDensityLevel } from './config/density';

const densityLevel = inferDensityLevel(question, answer.blocks.length);
// Returns 'low', 'medium', or 'high' based on:
// - Question length (words)
// - Multiple questions (question marks)
// - Multi-part indicators ("and", "also", "furthermore")
// - List indicators ("list", "enumerate", "what are")
// - Number of answer blocks generated
```

---

## Performance & Cost Impact

### Latency Comparison (for "What is AI transparency?")

| Density | Research | Answer | Graph | **Total** |
|---------|----------|--------|-------|-----------|
| Low     | ~700ms   | ~8s    | ~12s  | **~21s**  |
| Medium  | ~1100ms  | ~8s    | ~19s  | **~28s**  |
| High    | ~1400ms  | ~8s    | ~30s  | **~39s**  |

### Cost Comparison (per query)

| Density | Exa Cost | LLM Cost | Embedding Cost | **Total** |
|---------|----------|----------|----------------|-----------|
| Low     | $0.015   | ~$0.0003 | ~$0.00002      | **~$0.015** |
| Medium  | $0.025   | ~$0.0005 | ~$0.00003      | **~$0.026** |
| High    | $0.030   | ~$0.0008 | ~$0.00004      | **~$0.031** |

**Note:** Most of the cost comes from Exa search. LLM and embedding costs are minimal.

---

## Tuning Recommendations

### When to Use Each Level

**Low Density:**
- Simple factual questions ("What is X?", "Define Y")
- Questions with short answers (1-2 conceptual blocks)
- Quick lookups or confirmations
- Resource-constrained environments
- Preview/draft mode

**Medium Density (Default):**
- Most general questions
- Balanced detail and performance
- Standard user queries
- Recommended starting point

**High Density:**
- Complex multi-part questions
- Research-intensive queries
- Questions requiring comprehensive evidence
- "List all", "Compare and contrast", "Explain in detail"
- Final/production mode for important queries

### Custom Tuning

You can create custom density configurations by modifying `src/config/density.ts`:

```typescript
export const DENSITY_PRESETS: Record<DensityLevel, DensityConfig> = {
  // Add your custom level
  custom: {
    exaNumResults: 8,
    directSourcesPerBlock: { min: 1, target: 3, max: 5 },
    secondarySources: {
      topSourcesToProcess: 4,
      conceptsPerSource: 3,
      maxTotalConcepts: 25,
    },
    semanticEdges: {
      minSimilarity: 0.62,
      topK: 5,
      maxEdges: 60,
    },
  },
};
```

---

## Visualization Impact

### Graph Complexity by Density

**Low Density:**
- Cleaner, more focused visualization
- Fewer nodes to position
- Less cluttered
- Easier to navigate
- Good for quick overviews

**Medium Density:**
- Balanced richness
- Good detail without overwhelming
- Natural clustering visible
- Recommended for most visualizations

**High Density:**
- Rich, interconnected network
- Shows deep relationships
- More semantic connections visible
- Best for research/exploration
- May need better layout algorithms

### Edge Weight Distribution

Higher density levels result in:
- More semantic edges with varying weights
- Greater range of similarity scores
- More opportunities for thickness-based visualization
- Richer inter-layer connections

---

## Migration Notes

### From Previous Version

The previous system was effectively **low density**:
- 5 sources (now 6-12)
- 3 sources processed for secondary concepts (now 3-8)
- 2-3 concepts per source (now 2-4)
- topK=3 semantic neighbors (now 4-8)
- maxEdges=40 (now 40-120)
- minSimilarity=0.65 (now 0.55-0.65)

**Impact:** Medium density produces ~50-70% more nodes and edges compared to the previous default.

---

## Future Enhancements

1. **User Preference:** Allow users to select density via API parameter
2. **Adaptive Density:** Automatically adjust based on question complexity
3. **Per-Layer Control:** Fine-tune each layer independently
4. **Response Time Target:** Adjust density to meet latency SLAs
5. **Cost Budget:** Cap density based on cost constraints
6. **Quality Metrics:** Use feedback to optimize density presets

---

## Configuration API

All density configuration is centralized in `src/config/density.ts`:

```typescript
// Get configuration
import { getDensityConfig, DensityLevel } from './config/density';

const config = getDensityConfig('medium');
console.log(config.exaNumResults); // 10

// Log configuration
import { logDensityConfig } from './config/density';

logDensityConfig('high', config);
// [DensityConfig] Using density level: HIGH
// [DensityConfig]   - Exa results: 12
// [DensityConfig]   - Sources per block: 1-8 (target: 5)
// [DensityConfig]   - Secondary concepts: up to 40 (4 per source)
// [DensityConfig]   - Semantic edges: up to 120 (topK: 8, minSim: 0.55)
```

---

## Testing

Run enhanced graph tests with default medium density:

```bash
npm run test:enhanced
```

Expected output for "What is AI transparency?":
- Total nodes: ~31
- Total edges: ~100
- Semantic edges: ~70
- Response time: ~28s
