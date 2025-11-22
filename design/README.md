# AI Thinking Graph - Design Documentation

## 📋 Overview

This directory contains the complete UI/UX design system for an AI transparency interface that visualizes reasoning through a 3D knowledge graph.

**Core Concept**: Users ask questions like ChatGPT, but watch the AI "think in space" through an immersive 3D globe showing sources, connections, and reasoning paths in real-time.

---

## 🗂️ Documentation Structure

### Core Design Documents

1. **[00-DESIGN-OVERVIEW.md](./00-DESIGN-OVERVIEW.md)**
   - Product vision and philosophy
   - Design principles
   - User journey
   - Success metrics
   - **Start here** for high-level understanding

2. **[01-VISUAL-DESIGN-SYSTEM.md](./01-VISUAL-DESIGN-SYSTEM.md)**
   - Complete color palette (dark mode)
   - Typography scale
   - Spacing system
   - Shadows, borders, effects
   - Tailwind config exports
   - **Reference for all visual styling**

3. **[02-LAYOUT-SPECIFICATIONS.md](./02-LAYOUT-SPECIFICATIONS.md)**
   - Master layout architecture
   - Sidebar, canvas, panel dimensions
   - Responsive breakpoints
   - Component positioning
   - **Blueprint for page structure**

4. **[03-GLOBE-SPECIFICATIONS.md](./03-GLOBE-SPECIFICATIONS.md)**
   - 3D scene setup (Three.js)
   - Globe states (idle, active)
   - Node and edge rendering
   - Camera animations
   - Interaction handling
   - Performance optimizations
   - **Technical guide for 3D implementation**

5. **[04-MOTION-ANIMATION-GUIDELINES.md](./04-MOTION-ANIMATION-GUIDELINES.md)**
   - Animation philosophy
   - Easing curves and durations
   - Complete animation catalog
   - Performance budgets
   - Reduced motion support
   - **Definitive motion design reference**

6. **[05-MVP-V2-FEATURE-MATRIX.md](./05-MVP-V2-FEATURE-MATRIX.md)**
   - MVP feature list (must-haves)
   - V2 feature roadmap (nice-to-haves)
   - Priority levels
   - Complexity estimates
   - Launch checklist
   - **Roadmap and scope definition**

### Interaction Flows

7. **[flows/01-PRIMARY-INTERACTION-FLOW.md](./flows/01-PRIMARY-INTERACTION-FLOW.md)**
   - Complete user journey from idle → answer → exploration
   - Frame-by-frame storyboard
   - Animation timing
   - State transitions
   - **Visualizes the core experience**

8. **[flows/02-CLUSTERING-MODE-FLOW.md](./flows/02-CLUSTERING-MODE-FLOW.md)**
   - Clustering activation
   - Tier-based reorganization
   - Color coding logic
   - Panel controls
   - **Secondary feature flow**

### Component Library

9. **[components/COMPONENT-LIBRARY.md](./components/COMPONENT-LIBRARY.md)**
   - All reusable UI components
   - Variants and states
   - HTML/CSS specifications
   - JavaScript behaviors
   - **Component reference for development**

### Visual Mockups

10. **[mockups/SCREEN-MOCKUPS.md](./mockups/SCREEN-MOCKUPS.md)**
    - ASCII wireframes for all key screens
    - Responsive layouts
    - State variations
    - Implementation notes
    - **Quick visual reference**

---

## 🎯 Quick Navigation

### For Product Managers
- Start: [Design Overview](./00-DESIGN-OVERVIEW.md)
- Then: [MVP Feature Matrix](./05-MVP-V2-FEATURE-MATRIX.md)
- Reference: [Primary Interaction Flow](./flows/01-PRIMARY-INTERACTION-FLOW.md)

### For Designers
- Start: [Visual Design System](./01-VISUAL-DESIGN-SYSTEM.md)
- Then: [Motion Guidelines](./04-MOTION-ANIMATION-GUIDELINES.md)
- Reference: [Screen Mockups](./mockups/SCREEN-MOCKUPS.md)

### For Frontend Engineers
- Start: [Layout Specifications](./02-LAYOUT-SPECIFICATIONS.md)
- Then: [Component Library](./components/COMPONENT-LIBRARY.md)
- Reference: [Visual Design System](./01-VISUAL-DESIGN-SYSTEM.md) for tokens

### For 3D/WebGL Engineers
- Start: [Globe Specifications](./03-GLOBE-SPECIFICATIONS.md)
- Then: [Motion Guidelines](./04-MOTION-ANIMATION-GUIDELINES.md) (3D animations)
- Reference: [Primary Flow](./flows/01-PRIMARY-INTERACTION-FLOW.md) for timing

### For QA/Testing
- Start: [MVP Feature Matrix](./05-MVP-V2-FEATURE-MATRIX.md) (launch checklist)
- Then: [Primary Interaction Flow](./flows/01-PRIMARY-INTERACTION-FLOW.md) (test scenarios)
- Reference: [Component Library](./components/COMPONENT-LIBRARY.md) (states to test)

---

## 🛠️ Tech Stack Recommendations

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Radix UI + Tailwind CSS
- **State**: Zustand or Jotai
- **Data Fetching**: TanStack Query

### 3D Rendering
- **Primary**: Three.js
- **Alternative**: React Three Fiber
- **Controls**: OrbitControls from three/examples

### Animation
- **2D/UI**: Framer Motion
- **3D**: GSAP + Three.js native
- **Easing**: Custom cubic-bezier curves (see Motion Guidelines)

### Performance
- **Rendering**: WebGL (Three.js default)
- **Future**: WebGPU (V2, optional)
- **Optimization**: Level of Detail (LOD), frustum culling

---

## 🎨 Design Tokens Export

### For Tailwind CSS

Copy this into your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#131318',
        elevated: '#1a1a22',
        accent: {
          cyan: '#4dd4d4',
          purple: '#9d7ced',
          green: '#4dda64',
          blue: '#4d9eff',
        },
        cluster: {
          tier1: '#4dda64',
          tier2: '#4dd4d4',
          tier3: '#9d7ced',
          tier4: '#4d6b8f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'sidebar': '260px',
        'panel': '380px',
      }
    }
  }
}
```

### For CSS Variables

```css
:root {
  /* Backgrounds */
  --bg-void: #0a0a0f;
  --bg-surface: #131318;
  --bg-elevated: #1a1a22;

  /* Text */
  --text-primary: #e8e8f0;
  --text-secondary: #a8a8b8;
  --text-tertiary: #707080;

  /* Accents */
  --accent-cyan: #4dd4d4;
  --accent-purple: #9d7ced;
  --accent-green: #4dda64;

  /* Spacing */
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Layout */
  --sidebar-width: 260px;
  --panel-width: 380px;
  --input-height: 64px;
}
```

---

## ✅ MVP Implementation Checklist

Use this as you build the MVP:

### Week 1: Foundation
- [ ] Set up Next.js project with Tailwind
- [ ] Implement design system tokens
- [ ] Build layout shell (sidebar, canvas, input)
- [ ] Initialize Three.js scene

### Week 2: Core 3D
- [ ] Idle globe state (wireframe, rotation)
- [ ] Camera controls (orbit, zoom)
- [ ] Answer Core component
- [ ] Node spawning system
- [ ] Edge rendering

### Week 3: Interactions
- [ ] Node hover tooltips
- [ ] Node click → detail panel
- [ ] Real-time highlighting system
- [ ] Camera animations (zoom, reset)

### Week 4: Chat & Clustering
- [ ] Chat input + answer streaming
- [ ] Chat history sidebar
- [ ] Session persistence
- [ ] Clustering mode toggle
- [ ] Tier-based reorganization

### Week 5: Polish
- [ ] Motion refinements
- [ ] Accessibility (keyboard, screen reader)
- [ ] Responsive breakpoints
- [ ] Performance optimization
- [ ] Error states & loading indicators

---

## 📐 Key Dimensions Reference

Quick reference for common measurements:

| Element | Dimension |
|---------|-----------|
| Sidebar width | 260px |
| Right panel width | 380px |
| Input bar height | 64px |
| Input max-width | 840px |
| Panel header height | 64px |
| Button height (primary) | 44px |
| Icon button size | 40px |
| Border radius (md) | 8px |
| Border radius (lg) | 12px |

---

## 🎬 Animation Timing Reference

Common animation durations:

| Animation | Duration | Easing |
|-----------|----------|--------|
| Tooltip fade | 150ms | power1.out |
| Button hover | 150ms | power2.out |
| Panel slide | 300ms | power2.out |
| Node spawn | 500ms | back.out(2.5) |
| Node highlight | 400ms | elastic.out |
| Camera zoom | 1500ms | power2.inOut |
| Clustering | 1500ms | power2.inOut |

---

## 🔍 Testing Scenarios

Key flows to test:

1. **First Load**
   - Idle globe rotates smoothly
   - Input bar is focused on load
   - Empty state message visible

2. **First Question**
   - Camera zooms in smoothly
   - Answer Core materializes
   - Nodes spawn with stagger
   - Answer streams in real-time
   - Nodes highlight as AI thinks

3. **Node Exploration**
   - Hover shows tooltip
   - Click opens detail panel
   - Panel shows source URL, content, contribution
   - Other nodes dim when one selected

4. **Clustering**
   - Toggle activates reorganization
   - Nodes group by tier (smooth animation)
   - Colors update correctly
   - Panel shows tier breakdown

5. **Follow-Up Question**
   - Globe resets for new query
   - Previous graph preserved in history
   - Can switch between sessions

6. **Accessibility**
   - Keyboard navigation works (Tab, Enter, Escape)
   - Screen reader announces state changes
   - Reduced motion disables animations
   - Focus states visible

---

## 🚀 Launch Criteria

Before going live, ensure:

- [ ] Core flow (ask → see graph → explore) works end-to-end
- [ ] Maintains 60fps with up to 20 nodes
- [ ] WCAG AA accessibility compliance
- [ ] Mobile/tablet responsive (>768px)
- [ ] All P0 features from MVP matrix implemented
- [ ] Error handling for API failures
- [ ] Loading states for all async operations
- [ ] Analytics tracking in place

---

## 📞 Design System Maintainers

When updating this design system:

1. **Update the source document** (e.g., Visual Design System)
2. **Reflect changes in mockups** if visual
3. **Update component library** if affects components
4. **Notify engineering team** for breaking changes
5. **Version the design** (add date stamp)

---

## 📚 External Resources

### Inspiration & Research
- [Three.js Examples](https://threejs.org/examples/)
- [Force-Directed Graphs](https://github.com/vasturiano/3d-force-graph)
- [Knowledge Graph Visualizations](https://cambridge-intelligence.com/keylines/)

### Tools
- [Figma → Export to Three.js](https://www.figma.com/community/plugin/805195045652542632/Spline---3D-Design)
- [Easing Functions Reference](https://easings.net/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎯 Success Metrics (Reminder)

Track these post-launch:

- **Engagement**: >3min avg session time
- **Exploration**: >15% node click-through rate
- **Completion**: <5s to first node spawn
- **Accessibility**: Zero critical violations
- **Performance**: <2% bounce from jank
- **Sentiment**: >80% positive feedback

---

**Version**: 1.0.0
**Last Updated**: 2025-11-22
**Status**: Ready for Implementation

---

For questions or clarifications, reference the specific document or open an issue in the project repository.
