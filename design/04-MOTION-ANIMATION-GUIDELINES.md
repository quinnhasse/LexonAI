# Motion & Animation Guidelines

## Philosophy

Motion in this interface should feel like **real thinking**, not loading bars or arbitrary decoration. Every animation serves a purpose:
- **Spatial understanding** - Help users comprehend 3D space
- **Attention guidance** - Direct focus to important changes
- **Emotional tone** - Calm, confident, intelligent
- **Feedback** - Confirm interactions

---

## Animation Principles

### 1. **Natural, Not Mechanical**
Use organic easing curves, slight asymmetry, and micro-variations to avoid robotic feel.

❌ **Avoid**: Linear easing, identical timings, symmetric in/out
✅ **Use**: Power curves, elastic overshoots, staggered delays

### 2. **Purposeful, Not Decorative**
Every animation must communicate state change or guide attention.

❌ **Avoid**: Animations "because it looks cool"
✅ **Use**: Animations that teach, guide, or provide feedback

### 3. **Performant, Not Janky**
Target 60fps. Prefer GPU-accelerated properties. Budget frame time carefully.

❌ **Avoid**: Layout-triggering properties (width, height, top, left)
✅ **Use**: Transform (translate, scale, rotate), opacity

### 4. **Respectful, Not Overwhelming**
Honor reduced motion preferences. Provide instant alternatives.

---

## Core Animation Library

### Easing Functions

```javascript
// Custom easing curves
const easing = {
  // Smooth, confident movements
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Entering elements
  enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Exiting elements
  exit: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Organic "thinking" feel
  thinking: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Elastic overshoot (use sparingly)
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Bounce (node spawns)
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
};
```

### Duration Scale

```javascript
const duration = {
  instant: 100,      // Tooltips, hovers
  fast: 200,         // UI state changes
  normal: 300,       // Standard transitions
  slow: 500,         // Emphasis, important changes
  slowest: 800,      // Large spatial changes
  cinematic: 1500    // Camera movements
};
```

---

## Animation Catalog

### UI Layer Animations

#### 1. Panel Slide In/Out

**Use case**: Right panel opening/closing

```javascript
// Slide in from right
gsap.to(panel, {
  x: 0,
  duration: 0.3,
  ease: 'power2.out',
  onStart: () => {
    panel.style.display = 'block';
  }
});

// Slide out
gsap.to(panel, {
  x: 380, // panel width
  duration: 0.25,
  ease: 'power2.in',
  onComplete: () => {
    panel.style.display = 'none';
  }
});
```

#### 2. Button Hover/Press

**Use case**: Interactive buttons

```css
.button {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-glow-cyan);
}

.button:active {
  transform: scale(0.98);
}
```

#### 3. Tooltip Fade In/Out

**Use case**: Node hover tooltips

```javascript
// Fade in
gsap.to(tooltip, {
  opacity: 1,
  y: -8,
  duration: 0.15,
  ease: 'power1.out'
});

// Fade out
gsap.to(tooltip, {
  opacity: 0,
  y: 0,
  duration: 0.1,
  ease: 'power1.in'
});
```

#### 4. Input Bar Focus

**Use case**: Text input activation

```css
.input-container {
  transition: border-color 200ms, box-shadow 200ms;
}

.input-container:focus-within {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px rgba(77, 212, 212, 0.2);
}
```

---

### 3D Scene Animations

#### 5. Camera Zoom In (Question Submitted)

**Use case**: Entering answer space

```javascript
function zoomIntoGlobe() {
  gsap.to(camera.position, {
    z: 18,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.updateProjectionMatrix();
    }
  });

  // Slight FOV change for depth
  gsap.to(camera, {
    fov: 55,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.updateProjectionMatrix();
    }
  });
}
```

**Timing**: 1.5s total
**Feel**: Cinematic, smooth entry into AI's mind

#### 6. Camera Reset

**Use case**: User clicks reset button

```javascript
function resetCamera() {
  const duration = 1.2;

  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 25,
    duration: duration,
    ease: 'power3.inOut'
  });

  gsap.to(controls.target, {
    x: 0,
    y: 0,
    z: 0,
    duration: duration,
    ease: 'power3.inOut',
    onUpdate: () => controls.update()
  });

  gsap.to(camera, {
    fov: 50,
    duration: duration,
    ease: 'power3.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  });
}
```

**Timing**: 1.2s total
**Feel**: Confident return to overview

#### 7. Node Spawn

**Use case**: Knowledge node appearing

```javascript
function spawnNode(node) {
  // Start invisible and scaled down
  node.mesh.scale.set(0, 0, 0);
  node.mesh.material.opacity = 0;
  scene.add(node.mesh);

  // Animate in with elastic overshoot
  gsap.to(node.mesh.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.5,
    ease: 'back.out(2.5)',
    delay: node.spawnDelay || 0
  });

  gsap.to(node.mesh.material, {
    opacity: 1,
    duration: 0.3,
    delay: node.spawnDelay || 0
  });

  // Spawn pulse
  gsap.fromTo(node.mesh.material, {
    emissiveIntensity: 0.8
  }, {
    emissiveIntensity: 0.3,
    duration: 0.6,
    ease: 'power2.out',
    delay: (node.spawnDelay || 0) + 0.2
  });
}
```

**Timing**: 0.5s per node, staggered 150ms
**Feel**: Organic materialization

#### 8. Node Highlight (Active Contribution)

**Use case**: Node contributes to answer step

```javascript
function highlightNode(node) {
  // Scale up
  gsap.to(node.mesh.scale, {
    x: 1.3,
    y: 1.3,
    z: 1.3,
    duration: 0.4,
    ease: 'elastic.out(1, 0.5)'
  });

  // Increase glow
  gsap.to(node.mesh.material, {
    emissiveIntensity: 0.8,
    duration: 0.3,
    ease: 'power2.out'
  });

  // Outer glow pulse
  const glow = node.mesh.children[0]; // Assuming glow is first child
  gsap.fromTo(glow.scale, {
    x: 1.2, y: 1.2, z: 1.2
  }, {
    x: 1.5, y: 1.5, z: 1.5,
    duration: 0.8,
    ease: 'power1.out',
    repeat: 1,
    yoyo: true
  });
}
```

**Timing**: 0.4s scale + 0.8s pulse
**Feel**: "This node is active now"

#### 9. Node Dim (Not Contributing)

**Use case**: Unused sources fading back

```javascript
function dimNode(node) {
  gsap.to(node.mesh.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.3,
    ease: 'power2.out'
  });

  gsap.to(node.mesh.material, {
    opacity: 0.4,
    emissiveIntensity: 0.1,
    duration: 0.3
  });
}
```

**Timing**: 0.3s
**Feel**: De-emphasize smoothly

#### 10. Edge Glow (Connection Active)

**Use case**: Edge lights up when traversed

```javascript
function glowEdge(edge) {
  const originalColor = edge.material.color.clone();

  gsap.to(edge.material, {
    opacity: 0.8,
    duration: 0.3,
    ease: 'power2.out'
  });

  gsap.to(edge.material.color, {
    r: 0x4d / 255,
    g: 0xd4 / 255,
    b: 0xd4 / 255,
    duration: 0.2
  });

  // Fade back after 1s
  setTimeout(() => {
    gsap.to(edge.material, {
      opacity: 0.3,
      duration: 0.5
    });
    gsap.to(edge.material.color, {
      r: originalColor.r,
      g: originalColor.g,
      b: originalColor.b,
      duration: 0.5
    });
  }, 1000);
}
```

**Timing**: 0.3s glow, 1s hold, 0.5s fade
**Feel**: Information "flowing" along edge

#### 11. Answer Core Materialize

**Use case**: Central answer block appearing

```javascript
function materializeAnswerCore() {
  answerCore.scale.set(0, 0, 0);
  answerCore.material.opacity = 0;
  scene.add(answerCore);

  // Scale in with overshoot
  gsap.to(answerCore.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.8,
    ease: 'back.out(1.7)'
  });

  gsap.to(answerCore.material, {
    opacity: 1,
    duration: 0.5
  });

  // Spawn glow pulse
  gsap.fromTo(answerCore.material, {
    emissiveIntensity: 0.5
  }, {
    emissiveIntensity: 0.1,
    duration: 1.2,
    ease: 'power2.out'
  });
}
```

**Timing**: 0.8s total
**Feel**: Confident, central focus

#### 12. Clustering Reorganization

**Use case**: Nodes regrouping into tiers

```javascript
function animateClusteringOn(nodes) {
  nodes.forEach((node, i) => {
    // Staggered position change
    gsap.to(node.mesh.position, {
      x: node.tierPosition.x,
      y: node.tierPosition.y,
      z: node.tierPosition.z,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: i * 0.02 // 20ms stagger per node
    });

    // Color transition
    gsap.to(node.mesh.material.color, {
      r: node.tierColor.r,
      g: node.tierColor.g,
      b: node.tierColor.b,
      duration: 0.8,
      delay: 0.3
    });

    // Scale variance by tier (closer = bigger)
    const scaleMultiplier = 1 + (4 - node.tier) * 0.1;
    gsap.to(node.mesh.scale, {
      x: scaleMultiplier,
      y: scaleMultiplier,
      z: scaleMultiplier,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.4
    });
  });

  // Camera zoom out to fit
  gsap.to(camera.position, {
    z: 28,
    duration: 1.5,
    ease: 'power2.inOut'
  });
}
```

**Timing**: 1.5s total (staggered)
**Feel**: Magnetic reorganization

---

## Micro-Interactions

### Node Hover

```javascript
// On mouse enter
gsap.to(hoveredNode.scale, {
  x: 1.15,
  y: 1.15,
  z: 1.15,
  duration: 0.2,
  ease: 'power2.out'
});

// Cursor change
canvas.style.cursor = 'pointer';
```

### Node Click

```javascript
// Immediate feedback
gsap.to(clickedNode.scale, {
  x: 0.95,
  y: 0.95,
  z: 0.95,
  duration: 0.1,
  ease: 'power2.out',
  yoyo: true,
  repeat: 1
});

// Then selection state
setTimeout(() => {
  gsap.to(clickedNode.scale, {
    x: 1.4,
    y: 1.4,
    z: 1.4,
    duration: 0.3,
    ease: 'back.out(2)'
  });
}, 200);
```

### Loading Pulse

**Use case**: "Thinking..." state

```javascript
function startThinkingPulse() {
  const pulse = gsap.to(answerCore.material, {
    emissiveIntensity: 0.3,
    duration: 1.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  return pulse; // Return timeline to kill later
}

function stopThinkingPulse(pulseTimeline) {
  pulseTimeline.kill();
  gsap.to(answerCore.material, {
    emissiveIntensity: 0.1,
    duration: 0.3
  });
}
```

---

## Timing Patterns

### Staggered Spawns

**Pattern**: Elements appear sequentially with slight overlap

```javascript
const stagger = {
  // Even spacing
  even: (index) => index * 0.15,

  // Accelerating
  accel: (index) => Math.pow(index, 1.2) * 0.05,

  // Decelerating (use for end of sequence)
  decel: (index, total) => {
    const progress = index / total;
    return (1 - Math.pow(1 - progress, 2)) * 2;
  }
};
```

**Usage**:
```javascript
nodes.forEach((node, i) => {
  node.spawnDelay = stagger.even(i);
  spawnNode(node);
});
```

### Choreographed Sequences

**Pattern**: Multi-step animation with precise timing

```javascript
function answerRevealSequence() {
  const timeline = gsap.timeline();

  timeline
    .call(zoomIntoGlobe)                          // 0s
    .call(materializeAnswerCore, null, '+=1.5')   // 1.5s
    .call(spawnAllNodes, null, '+=0.6')           // 2.1s
    .call(startAnswerStream, null, '+=2.0')       // 4.1s
    .call(enableExploration, null, '+=0.5');      // 4.6s

  return timeline;
}
```

---

## Performance Budget

### Frame Time Allocation (16.67ms @ 60fps)

| Task | Budget | Notes |
|------|--------|-------|
| 3D Rendering | 8ms | Scene complexity dependent |
| Animation Updates | 2ms | GSAP ticks, material updates |
| Raycasting | 1ms | Only on mousemove (throttled) |
| Layout/Paint | 3ms | Minimize DOM changes |
| JavaScript | 2ms | Event handlers, logic |
| **Margin** | 0.67ms | Buffer |

### Optimization Strategies

#### 1. Batch DOM Updates
```javascript
// ❌ Bad: Multiple reflows
nodes.forEach(node => {
  nodeElement.style.left = node.x + 'px';
  nodeElement.style.top = node.y + 'px';
});

// ✅ Good: Single batch
requestAnimationFrame(() => {
  nodes.forEach(node => {
    nodeElement.style.transform = `translate(${node.x}px, ${node.y}px)`;
  });
});
```

#### 2. Use GPU-Accelerated Properties
```css
/* ❌ Triggers layout */
.panel {
  left: 0;
  transition: left 300ms;
}

/* ✅ GPU accelerated */
.panel {
  transform: translateX(0);
  transition: transform 300ms;
  will-change: transform; /* Hint to browser */
}
```

#### 3. Throttle Expensive Operations
```javascript
// Raycasting on every mousemove is expensive
let lastRaycast = 0;
const raycastThrottle = 50; // ms

canvas.addEventListener('mousemove', (e) => {
  const now = performance.now();
  if (now - lastRaycast > raycastThrottle) {
    performRaycast(e);
    lastRaycast = now;
  }
});
```

#### 4. Level of Detail (LOD)
```javascript
// Use simpler geometry when far away
const nodeLOD = new THREE.LOD();
nodeLOD.addLevel(highPolyMesh, 0);    // < 10 units
nodeLOD.addLevel(mediumPolyMesh, 10); // 10-20 units
nodeLOD.addLevel(lowPolyMesh, 20);    // > 20 units
```

---

## Reduced Motion Support

### Media Query

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### JavaScript Detection

```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Disable camera animations
  gsap.globalTimeline.timeScale(100); // Make all animations instant

  // Disable auto-rotate
  controls.autoRotate = false;

  // Disable node spawn animations
  nodes.forEach(node => {
    node.mesh.scale.set(1, 1, 1); // Instant appearance
    scene.add(node.mesh);
  });
}
```

---

## Animation Checklist

Before shipping any animation:

- [ ] **Purpose**: Does it serve a functional purpose?
- [ ] **Performance**: Does it maintain 60fps on target hardware?
- [ ] **Duration**: Is the timing appropriate (not too fast/slow)?
- [ ] **Easing**: Does it feel natural, not robotic?
- [ ] **Reduced Motion**: Does it respect user preferences?
- [ ] **Accessibility**: Can keyboard users perceive the change?
- [ ] **Distraction**: Does it help or hinder focus?

---

**Next**: Component Library Specifications →
