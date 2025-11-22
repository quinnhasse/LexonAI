# Clustering Mode Interaction Flow

## Overview

Clustering mode reorganizes nodes by their "distance from answer" into colored tiers. This helps users understand which sources directly supported the answer vs. background context.

---

## Frame 1: BEFORE CLUSTERING
**Starting State**: Answer complete, all nodes visible

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                       [Clustering OFF] [⟲]  │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │              ●     ●                               │
│        │     ●                                              │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   ANSWER    │                    │
│  ✓     │      ●         │    CORE     │          ●         │
│        │                │             │                    │
│        │           ●    └─────────────┘   ●                │
│        │                                                    │
│        │     ●          Random/semantic     ●               │
│        │              ● positioning                         │
└────────┴────────────────────────────────────────────────────┘
```

### Node Layout
- **Position**: Spherical or semantic-based
- **Colors**: All nodes same color (cyan) or role-based
- **No clear visual hierarchy**

---

## Frame 2: USER CLICKS "CLUSTERING"
**Duration**: Instant UI update
**Timestamp**: Click

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                        [Clustering ON] [⟲]  │
│                                        (highlighted)         │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │              ●     ●                               │
│        │     ●                                              │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   ANSWER    │                    │
│  ✓     │      ●         │    CORE     │          ●         │
│        │                │             │                    │
│        │           ●    └─────────────┘   ●                │
│        │                                                    │
│        │     ●               ●          ●                   │
│        │              ●  (starting animation)               │
└────────┴────────────────────────────────────────────────────┘
```

### UI Changes
- **Toggle Button**: Background → accent-cyan, label "ON"
- **Panel Opens**: Right panel slides in with clustering controls

---

## Frame 3: NODES REORGANIZING
**Duration**: 1.5 seconds (smooth physics animation)
**Timestamp**: 0:00 - 0:01.5

### Visual State
```
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ [≡]  ThinkGraph                        [Clustering ON] [⟲]  │ Clustering   │
├────────┬────────────────────────────────────────────────────┤ Controls  [×]│
│        │                                                    ├──────────────┤
│  [+]   │              ●  ●                                  │ Mode: ON     │
│        │     ●                                              │ [Toggle Off] │
│  Chat  │           ●    ┌─────────────┐      ●  ●          │              │
│   #1   │        ●       │   ANSWER    │         ●          │ Tiers:       │
│  ✓     │      ●    ●    │    CORE     │    ●    ●          │              │
│        │           ●    │             │  ●      ●          │ 🟢 Tier 1    │
│        │        ●       └─────────────┘     ●    ●         │   4 nodes    │
│        │   ●                   ●                  ●         │              │
│        │     ●   ●        (nodes moving        ●   ●       │ 🔵 Tier 2    │
│        │      ● ●          magnetically)          ●  ●     │   7 nodes    │
│        │                                                    │              │
│        │    ┌──────────────────────────────────┐           │ 🟣 Tier 3    │
│        │    │ Ask a follow-up...                │           │   3 nodes    │
│        │    └──────────────────────────────────┴─[→]       │              │
└────────┴────────────────────────────────────────────────────┴──────────────┘
```

### Animation Details

```javascript
// Compute tier distances
function computeNodeTiers(nodes, answerCore) {
  nodes.forEach(node => {
    // Determine tier based on:
    // 1. Direct citation in answer = Tier 1
    // 2. Supports Tier 1 nodes = Tier 2
    // 3. Background context = Tier 3
    // 4. Peripheral = Tier 4
    node.tier = calculateTier(node);
    node.targetPosition = getTierPosition(node.tier);
    node.targetColor = getTierColor(node.tier);
  });
}

// Animate reorganization
function animateClustering() {
  nodes.forEach((node, i) => {
    // Position
    gsap.to(node.mesh.position, {
      x: node.targetPosition.x,
      y: node.targetPosition.y,
      z: node.targetPosition.z,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: i * 0.02 // Slight stagger
    });

    // Color
    gsap.to(node.mesh.material.color, {
      r: node.targetColor.r,
      g: node.targetColor.g,
      b: node.targetColor.b,
      duration: 0.8
    });
  });

  // Camera adjust to fit all tiers
  fitCameraToTiers(1.5);
}
```

### Tier Positioning

**Concentric Rings Around Answer Core**
```javascript
function getTierPosition(tier) {
  const radius = tier * 5; // Tier 1 = 5 units, Tier 2 = 10 units, etc.
  const angle = (index / tierNodeCount) * Math.PI * 2;

  return {
    x: Math.cos(angle) * radius,
    y: (Math.random() - 0.5) * 2, // Slight vertical variance
    z: Math.sin(angle) * radius
  };
}
```

---

## Frame 4: CLUSTERING COMPLETE
**Duration**: Static (until interaction)
**Timestamp**: 0:01.5

### Visual State
```
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ [≡]  ThinkGraph                        [Clustering ON] [⟲]  │ Clustering   │
├────────┬────────────────────────────────────────────────────┤ Controls  [×]│
│        │                                                    ├──────────────┤
│  [+]   │           🟣  🟣                                    │ Mode: ON     │
│        │     🟣                 🟣                           │ [Toggle Off] │
│  Chat  │        🟣🔵         🟣                              │              │
│   #1   │           🔵🔵                  🟣🟣                │ Tiers:       │
│  ✓     │      🔵  🟢🟢  ┌─────────┐  🟢🟢  🔵               │              │
│        │         🟢🟢   │ ANSWER  │   🟢🟢                  │ 🟢 Tier 1    │
│        │           🔵🔵 │  CORE   │ 🔵🔵                    │   Direct     │
│        │              🔵└─────────┘🔵  🔵                   │   4 nodes    │
│        │         🔵         🔵      🔵                       │   ← Closest  │
│        │     🟣                 🟣                           │              │
│        │           🟣  🟣                                    │ 🔵 Tier 2    │
│        │                                                    │   Supporting │
│        │    ┌──────────────────────────────────┐           │   7 nodes    │
│        │    │ Ask a follow-up...                │           │              │
│        │    └──────────────────────────────────┴─[→]       │ 🟣 Tier 3    │
│                                                             │   Background │
│                                                             │   3 nodes    │
│                                                             │   ← Farthest │
└─────────────────────────────────────────────────────────────┴──────────────┘
```

### Tier Layout

```
    Layer 3 (Purple - Background)
          ●   ●
       ●         ●

      Layer 2 (Cyan - Supporting)
         ●   ●
      ●   ●   ●   ●
         ●   ●

        Layer 1 (Green - Direct)
          ● ●
       ● ●   ● ●
          ● ●

        [Answer Core]
```

### Color Coding

| Tier | Color | Meaning | Distance from Core |
|------|-------|---------|-------------------|
| 1 | 🟢 Green | Directly cited in answer | 5 units |
| 2 | 🔵 Cyan | Supports Tier 1 evidence | 10 units |
| 3 | 🟣 Purple | Background context | 15 units |
| 4 | 🔷 Muted Blue | Peripheral / tangential | 20 units |

---

## Frame 5: USER HOVERS TIER 1 NODE
**Duration**: Instant
**Timestamp**: Hover

### Visual State
```
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ [≡]  ThinkGraph                        [Clustering ON] [⟲]  │ Clustering   │
├────────┬────────────────────────────────────────────────────┤ Controls  [×]│
│        │           🟣  🟣      ┌─────────────┐              ├──────────────┤
│  [+]   │     🟣                │ "Solar wind │              │ Mode: ON     │
│        │        🟣🔵         🟣 │ particles   │              │              │
│  Chat  │           🔵🔵         │ collide..." │     🟣🟣     │ Hover:       │
│   #1   │      🔵  🟢🟢  ┌──────└─────────┐  🟢🟢  🔵        │              │
│  ✓     │         🟢🟢   │ ANSWER  │   ⬤ 🟢                  │ ✓ Tier 1     │
│        │           🔵🔵 │  CORE   │ 🔵🔵   (hovered)         │   "Solar wind│
│        │              🔵└─────────┘🔵  🔵                    │   article"   │
│        │         🔵         🔵      🔵                       │              │
│        │     🟣                 🟣                           │ Used in:     │
│        │           🟣  🟣                                    │ - Sentence 2 │
│        │                                                    │ - Sentence 5 │
│        │    ┌──────────────────────────────────┐           │              │
│        │    │ Ask a follow-up...                │           │ Connected:   │
│        │    └──────────────────────────────────┴─[→]       │ → 3 T2 nodes │
└─────────────────────────────────────────────────────────────┴──────────────┘
```

### Interactive Highlights

- **Hovered Node**: Scales 1.2x, tooltip shows title
- **Right Panel**: Updates with tier info + usage details
- **Connected Nodes**: Edges to connected Tier 2 nodes brighten

---

## Frame 6: TOGGLE CLUSTERING OFF
**Duration**: 1.5 seconds (reverse animation)
**Timestamp**: Click toggle

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                       [Clustering OFF] [⟲]  │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  [+]   │           ●  ●                                     │
│        │     ●       ●                                      │
│  Chat  │        ●  ●         ●                              │
│   #1   │           ●  ●                      ●  ●           │
│  ✓     │      ●  ●    ┌─────────┐    ●  ●  ●               │
│        │         ●    │ ANSWER  │   ●                      │
│        │           ●  │  CORE   │ ●  ●                     │
│        │              └─────────┘  ●                       │
│        │         ●         ●      ●                         │
│        │     ●       ●         ●                            │
│        │           ●  ●                                     │
│        │          (returning to original positions)         │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Ask a follow-up...                │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Animation Details

```javascript
function disableClustering() {
  // Close panel
  gsap.to(rightPanel, {
    x: 380,
    duration: 0.3,
    ease: 'power2.in'
  });

  // Restore original positions & colors
  nodes.forEach((node, i) => {
    gsap.to(node.mesh.position, {
      x: node.originalPosition.x,
      y: node.originalPosition.y,
      z: node.originalPosition.z,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: i * 0.02
    });

    gsap.to(node.mesh.material.color, {
      r: node.originalColor.r,
      g: node.originalColor.g,
      b: node.originalColor.b,
      duration: 0.8
    });
  });

  // Restore camera
  gsap.to(camera.position, {
    z: 22,
    duration: 1.2,
    ease: 'power2.out'
  });
}
```

---

## Clustering Algorithm

### Tier Assignment Logic

```javascript
function calculateTier(node, answerData) {
  // Tier 1: Directly cited in final answer
  if (answerData.citations.includes(node.id)) {
    return 1;
  }

  // Tier 2: Supports Tier 1 nodes (linked in graph)
  const tier1Nodes = getTier1Nodes();
  const isLinkedToTier1 = tier1Nodes.some(t1Node =>
    areNodesConnected(node, t1Node)
  );
  if (isLinkedToTier1) {
    return 2;
  }

  // Tier 3: Retrieved but not directly used
  if (answerData.retrievedNodes.includes(node.id)) {
    return 3;
  }

  // Tier 4: Peripheral / background
  return 4;
}
```

### Visual Encoding

```javascript
const tierConfig = {
  1: {
    color: 0x4dda64,      // Green
    radius: 5,            // Close to core
    label: 'Direct Support',
    emissiveIntensity: 0.4
  },
  2: {
    color: 0x4dd4d4,      // Cyan
    radius: 10,
    label: 'Supporting Evidence',
    emissiveIntensity: 0.3
  },
  3: {
    color: 0x9d7ced,      // Purple
    radius: 15,
    label: 'Background Context',
    emissiveIntensity: 0.2
  },
  4: {
    color: 0x4d6b8f,      // Muted blue
    radius: 20,
    label: 'Peripheral',
    emissiveIntensity: 0.1
  }
};
```

---

## Right Panel: Clustering Controls

### Panel Content (When Clustering ON)

```html
<div class="clustering-panel">
  <header>
    <h3>Clustering Mode</h3>
    <button class="toggle-off">Turn Off</button>
  </header>

  <section class="tier-breakdown">
    <h4>Tier Breakdown</h4>

    <div class="tier-item tier-1">
      <span class="tier-dot" style="background: #4dda64"></span>
      <div class="tier-info">
        <span class="tier-label">Tier 1 - Direct Support</span>
        <span class="tier-count">4 nodes</span>
      </div>
    </div>

    <div class="tier-item tier-2">
      <span class="tier-dot" style="background: #4dd4d4"></span>
      <div class="tier-info">
        <span class="tier-label">Tier 2 - Supporting</span>
        <span class="tier-count">7 nodes</span>
      </div>
    </div>

    <div class="tier-item tier-3">
      <span class="tier-dot" style="background: #9d7ced"></span>
      <div class="tier-info">
        <span class="tier-label">Tier 3 - Background</span>
        <span class="tier-count">3 nodes</span>
      </div>
    </div>
  </section>

  <section class="color-legend">
    <h4>Visual Guide</h4>
    <p>Nodes closer to the answer core were more important to the final response.</p>
    <ul>
      <li>🟢 = Directly cited</li>
      <li>🔵 = Supported direct evidence</li>
      <li>🟣 = Provided context</li>
    </ul>
  </section>

  <footer>
    <button class="export-view">Export Graph</button>
  </footer>
</div>
```

---

## Use Cases

### When to Use Clustering

1. **Complex multi-source answers**: User wants to see which sources mattered most
2. **Research tasks**: Understanding evidence hierarchy
3. **Trust verification**: "Did the AI rely on credible sources?"
4. **Education**: Learning how information connects

### User Benefits

- **Visual hierarchy**: Instantly see source importance
- **Reduced overwhelm**: Group by relevance, not random scatter
- **Better exploration**: Focus on Tier 1 first, expand as needed
- **Trust signal**: "AI used 4 direct sources, 7 supporting"

---

**Next**: Motion & Animation Guidelines →
