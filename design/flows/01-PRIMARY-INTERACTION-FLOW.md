# Primary Interaction Flow

## Storyboard: First Question Experience

This storyboard shows the complete user journey from landing to answer exploration.

---

## Frame 1: IDLE STATE
**Duration**: Until user action
**Timestamp**: 0:00

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                                    [ ] [⚙]  │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  [+]   │                  ╭──────────╮                     │
│  New   │                 ╱            ╲                    │
│  Chat  │                │   Slowly    │                    │
│        │                │  Rotating   │                    │
│        │                 ╲   Globe   ╱                     │
│        │                  ╰──────────╯                     │
│        │         (Wireframe sphere, faint grid)            │
│        │                                                    │
│        │      Floating particles add depth                 │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Ask anything to reveal the AI's  │           │
│        │    │ thinking...                      │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Elements
- **Sidebar**: Collapsed to icons (or minimal width)
- **Globe**: Auto-rotating at 0.5 speed
  - Wireframe opacity: 8%
  - Grid opacity: 5%
  - Particles drifting slowly
- **Input Bar**: Pulsing subtle glow on border (inviting)
- **Camera**: Default position (0, 0, 25)

### User State
- First impression moment
- Eyes drawn to rotating globe
- Calm, "knowledge universe" feeling

---

## Frame 2: USER TYPES QUESTION
**Duration**: ~5-10 seconds
**Timestamp**: 0:05

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                                    [ ] [⚙]  │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  [+]   │                  ╭──────────╮                     │
│        │                 ╱            ╲                    │
│        │                │    Globe    │                    │
│        │                │             │                    │
│        │                 ╲ (still)   ╱                     │
│        │                  ╰──────────╯                     │
│        │                                                    │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ What causes the northern lights? │           │
│        │    │                                   │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Elements
- **Input Bar**: Focused, border color shifts to --accent-cyan
- **Globe**: Auto-rotation slows to stop (anticipating action)
- **Send Button**: Highlighted, ready state

### User State
- Familiar typing experience (ChatGPT-like)
- Globe reacts subtly to input focus

---

## Frame 3: QUESTION SUBMITTED → CAMERA ZOOM
**Duration**: 1.5 seconds
**Timestamp**: 0:15 - 0:16.5

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                                    [ ] [⚙]  │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  [+]   │                                                    │
│        │              ╭──────────────╮                     │
│  Chat  │             ╱                ╲                    │
│   #1   │            │    ZOOMING IN   │                    │
│        │            │                 │                    │
│        │             ╲                ╱                     │
│        │              ╰──────────────╯                     │
│        │            (Globe enlarging)                       │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ [sent question minimized]         │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Animation Details
```javascript
// Camera movement
gsap.to(camera.position, {
  z: 18,
  duration: 1.5,
  ease: 'power2.inOut'
});

// Globe wireframe fade out
gsap.to(globeShell.material, {
  opacity: 0,
  duration: 0.8
});
```

### Elements
- **Camera**: Smoothly dollies in from z:25 → z:18
- **Globe Shell**: Fades out (wireframe no longer needed)
- **Input Bar**: Minimizes slightly, shows sent question as chip
- **Sidebar**: New chat #1 appears in history

### User State
- "Entering the AI's mind" feeling
- Smooth, cinematic transition
- Anticipation builds

---

## Frame 4: ANSWER CORE MATERIALIZES
**Duration**: 0.6 seconds
**Timestamp**: 0:17 - 0:17.6

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  [+]   │                                                    │
│        │                                                    │
│  Chat  │               ┌─────────────┐                     │
│   #1   │               │   ANSWER    │  ← Core block       │
│  ●     │               │    CORE     │     appears         │
│        │               │  (glowing)  │                     │
│        │               └─────────────┘                     │
│        │                                                    │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Northern lights...                │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Animation Details
```javascript
// Answer Core spawn
answerCore.scale.set(0, 0, 0);
answerCore.material.opacity = 0;

gsap.to(answerCore.scale, {
  x: 1, y: 1, z: 1,
  duration: 0.6,
  ease: 'back.out(1.7)' // Elastic overshoot
});

gsap.to(answerCore.material, {
  opacity: 1,
  duration: 0.4
});
```

### Elements
- **Answer Core**: Central rectangle materializes with glow
- **Background**: Particles clear from center (pushed outward)
- **UI**: Clustering toggle and camera reset buttons appear (top-right)

### User State
- "Here comes the answer" moment
- Core is magnetic focus point

---

## Frame 5: NODES START APPEARING
**Duration**: 2-4 seconds (depends on # of nodes)
**Timestamp**: 0:18 - 0:22

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │                    ●                               │
│        │     ●                                              │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   ANSWER    │                    │
│  ●     │      ●         │    CORE     │          ●         │
│        │                │  Thinking.. │                    │
│        │           ●    └─────────────┘   ●                │
│        │                       │                            │
│        │     ●                 │      ●                     │
│        │              ●        │                            │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Northern lights are caused by... │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Animation Details
```javascript
// Staggered node spawn
nodes.forEach((node, i) => {
  setTimeout(() => {
    node.mesh.scale.set(0, 0, 0);
    scene.add(node.mesh);

    gsap.to(node.mesh.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'back.out(2)'
    });

    // Draw edge to answer core
    createEdge(node.mesh, answerCore);
  }, i * 150); // 150ms stagger
});
```

### Elements
- **Nodes**: Appear one-by-one, popping in with elastic animation
- **Edges**: Thin lines connect each node to answer core
- **Answer Text**: Begins streaming in core (or below globe)
- **Node Colors**: Dimmed initially (not yet used)

### User State
- Watching sources "load into AI's mind"
- Counting nodes appearing
- Anticipating which will be used

---

## Frame 6: REAL-TIME HIGHLIGHTING
**Duration**: 5-15 seconds (answer generation)
**Timestamp**: 0:23 - 0:38

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │              ⬤     ●                               │
│        │     ⬤            (glowing)                         │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   ANSWER    │                    │
│  ●     │      ●         │             │     ⬤              │
│        │                │  [Text      │   (active)         │
│        │      ⬤         │   typing]   │                    │
│        │  (active)      └─────────────┘   ●                │
│        │     ●            ╱ │ ╲       ●                     │
│        │              ●  ╱  │  ╲                            │
│        │               (edges glow)                         │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Northern lights are caused by... │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘

Legend:
  ● = dim node (not yet used)
  ⬤ = highlighted node (actively contributing)
```

### Animation Details
```javascript
// As AI generates each sentence/chunk
function onAnswerChunkGenerated(chunkData) {
  const contributingNodes = chunkData.sourceNodes;

  contributingNodes.forEach(nodeId => {
    const node = nodesMap.get(nodeId);

    // Pulse highlight
    node.highlight();

    // Glow connecting edge
    const edge = edgesMap.get(`${nodeId}-core`);
    gsap.to(edge.material, {
      opacity: 0.8,
      color: new THREE.Color(0x4dd4d4),
      duration: 0.3
    });

    // Fade back after 1s
    setTimeout(() => {
      gsap.to(edge.material, {
        opacity: 0.3,
        duration: 0.5
      });
    }, 1000);
  });

  // Dim unused nodes
  const unusedNodes = getAllNodes().filter(n => !contributingNodes.includes(n.id));
  unusedNodes.forEach(node => node.dim());
}
```

### Elements
- **Active Nodes**: Scale up 1.3x, emissive intensity 0.8
- **Active Edges**: Glow cyan, opacity 0.8
- **Unused Nodes**: Dimmed to 40% opacity
- **Answer Text**: Streams word-by-word
- **Timing**: Micro-delays between highlights (feels like "thinking")

### User State
- "Watching the AI think" in real-time
- Understanding which sources matter
- Trust building through transparency

---

## Frame 7: ANSWER COMPLETE
**Duration**: 1 second
**Timestamp**: 0:39 - 0:40

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │              ⬤     ●                               │
│        │     ⬤                                              │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   COMPLETE  │                    │
│  ✓     │      ●         │   ANSWER    │     ⬤              │
│        │                │             │                    │
│        │      ⬤         │  (full text)│                    │
│        │                └─────────────┘   ●                │
│        │     ●            ╱ │ ╲       ●                     │
│        │              ●                                     │
│        │              (all edges visible)                   │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Ask a follow-up...                │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Animation Details
```javascript
// Completion pulse
gsap.to(answerCore.material, {
  emissiveIntensity: 0.3,
  duration: 0.5,
  yoyo: true,
  repeat: 1
});

// Restore all node opacity
allNodes.forEach(node => {
  gsap.to(node.mesh.material, {
    opacity: 1,
    duration: 0.5
  });
});

// Camera slight pullback for exploration
gsap.to(camera.position, {
  z: 22,
  duration: 1.0,
  ease: 'power2.out'
});
```

### Elements
- **Answer Core**: Subtle completion pulse
- **All Nodes**: Fully visible (no dimming)
- **Edges**: All connections visible
- **Camera**: Dollies back slightly for wider view
- **Input Bar**: Ready for follow-up

### User State
- Answer complete
- Ready to explore nodes
- Can ask follow-up or investigate sources

---

## Frame 8: USER HOVERS NODE
**Duration**: Instant
**Timestamp**: 0:45

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │         ●        ┌──────────────┐                  │
│  [+]   │              ⬤   │ Solar wind   │ ← Tooltip        │
│        │     ⬤            │ particles... │                  │
│  Chat  │           ●    ┌─└──────────────┐      ●          │
│   #1   │                │   COMPLETE     │                 │
│  ✓     │      ●         │   ANSWER       │     ⬤ ← Hovered │
│        │                │                │   (scaled)      │
│        │      ⬤         │  (full text)   │                 │
│        │                └────────────────┘   ●             │
│        │     ●            ╱ │ ╲       ●                    │
│        │              ●                                     │
│        │              cursor: pointer                       │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Ask a follow-up...                │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Elements
- **Hovered Node**: Scale 1.15x
- **Tooltip**: Appears near cursor showing node title
- **Cursor**: Changes to pointer
- **Node Glow**: Slightly brighter

### User State
- Discovering what nodes represent
- Deciding whether to click

---

## Frame 9: USER CLICKS NODE
**Duration**: 0.3 seconds
**Timestamp**: 0:46

### Visual State
```
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │ Solar Wind   │
├────────┬────────────────────────────────────────────────────┤ Article   [×]│
│        │         ●                                          ├──────────────┤
│  [+]   │              ⬤     ●                               │              │
│        │     ⬤                                              │ Source:      │
│  Chat  │           ●    ┌─────────────┐      ●             │ [nasa.gov]   │
│   #1   │                │   COMPLETE  │                    │              │
│  ✓     │      ●         │   ANSWER    │    ⬤ ← Selected    │ Content:     │
│        │                │             │  (highlighted)     │              │
│        │      ⬤         │  (dimmed)   │                    │ "Solar wind  │
│        │                └─────────────┘   ●                │  consists    │
│        │     ●            ╱ │ ╲       ●                     │  of..."      │
│        │              ●                                     │              │
│        │              (connected edges glow)                │ Role:        │
│        │    ┌──────────────────────────────────┐           │ Direct       │
│        │    │ Ask a follow-up...                │           │ evidence     │
│        │    └──────────────────────────────────┴─[→]       │              │
└────────┴────────────────────────────────────────────────────┴──────────────┘
```

### Animation Details
```javascript
// Panel slide in
gsap.to(rightPanel, {
  x: 0,
  duration: 0.3,
  ease: 'power2.out'
});

// Selected node emphasis
gsap.to(selectedNode.mesh.scale, {
  x: 1.4, y: 1.4, z: 1.4,
  duration: 0.3,
  ease: 'back.out(2)'
});

// Dim other nodes
otherNodes.forEach(node => {
  gsap.to(node.mesh.material, {
    opacity: 0.3,
    duration: 0.3
  });
});

// Highlight connected nodes
const connectedNodes = getConnectedNodes(selectedNode);
connectedNodes.forEach(node => {
  gsap.to(node.mesh.material, { opacity: 0.7 });
});
```

### Elements
- **Right Panel**: Slides in from right (0.3s)
- **Selected Node**: Scales 1.4x, stays highlighted
- **Other Nodes**: Dim to 30%
- **Connected Nodes**: Partial visibility (70%)
- **Edges to Selected**: Glow brightly
- **Globe**: Slightly dimmed background

### User State
- Reading source details
- Understanding node's contribution
- Can click URL to open source

---

## Frame 10: USER CLOSES PANEL & EXPLORES
**Duration**: Ongoing
**Timestamp**: 1:00+

### Visual State
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ThinkGraph                            [Clustering] [⟲] │
├────────┬────────────────────────────────────────────────────┤
│        │         ●                                          │
│  [+]   │              ⬤     ●                               │
│        │     ⬤                                              │
│  Chat  │           ●    ┌─────────────┐      ●             │
│   #1   │                │   COMPLETE  │                    │
│  ✓     │      ●         │   ANSWER    │     ⬤              │
│        │                │             │                    │
│        │      ⬤         │  (visible)  │                    │
│        │                └─────────────┘   ●                │
│        │     ●            ╱ │ ╲       ●                     │
│        │              ●  (rotating view)                    │
│        │                                                    │
│        │    ┌──────────────────────────────────┐           │
│        │    │ Ask a follow-up...                │           │
│        │    └──────────────────────────────────┴─[→]       │
└────────┴────────────────────────────────────────────────────┘
```

### Elements
- **Camera**: User orbits freely around globe
- **Controls**: Full orbit enabled
- **All Nodes**: Visible, explorable
- **Answer Core**: Remains centered
- **Input**: Ready for next question

### User State
- Freely exploring 3D space
- Orbiting to see different angles
- Understanding spatial relationships
- Deciding next action: ask follow-up or new question

---

**Next Storyboard**: Clustering Mode Flow →
