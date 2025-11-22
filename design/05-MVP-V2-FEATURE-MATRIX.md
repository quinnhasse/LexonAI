# MVP vs V2 Feature Matrix

## Development Phases

### MVP: Minimum Viable Product
**Goal**: Prove the core concept works and delivers value
**Timeline**: Launch-ready foundation
**Focus**: Essential features that demonstrate AI transparency

### V2: Enhanced Experience
**Goal**: Polish, power-user features, and advanced visualizations
**Timeline**: Post-MVP iteration
**Focus**: Depth, customization, and advanced insights

---

## Feature Breakdown

### ✅ MVP (Must Have)

#### Core Interface

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **ChatGPT-like layout** | P0 | Low | Left sidebar, center canvas, bottom input |
| **Dark mode default** | P0 | Low | Only dark mode in MVP |
| **Responsive layout** | P0 | Medium | Mobile collapses sidebar |
| **Keyboard shortcuts** | P1 | Low | Basic: Ctrl+K (focus), Escape (close) |

#### 3D Globe

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Idle state globe** | P0 | Medium | Wireframe sphere, slow rotation |
| **Orbit controls** | P0 | Low | Drag to rotate, scroll to zoom |
| **Camera zoom animation** | P0 | Medium | Question submit → zoom in |
| **Answer Core block** | P0 | Medium | Central rectangle with text |
| **Knowledge nodes** | P0 | High | Spheres with real-time spawn |
| **Connection edges** | P0 | Medium | Lines between nodes and core |
| **Node hover tooltip** | P0 | Low | Show title on hover |
| **Node click → detail panel** | P0 | Medium | Open right panel with node info |
| **Real-time highlighting** | P0 | High | Nodes light up as AI thinks |
| **Camera reset button** | P1 | Low | Return to default view |

#### Chat Functionality

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Text input** | P0 | Low | Auto-resize textarea |
| **Send button** | P0 | Low | Submit question |
| **Answer streaming** | P0 | High | Real-time text generation |
| **Chat history sidebar** | P0 | Medium | List past sessions |
| **New chat button** | P0 | Low | Start fresh session |
| **Session persistence** | P0 | Medium | Save chats to DB |
| **Multi-turn conversations** | P1 | Medium | Follow-up questions |

#### Node Details Panel

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Source URL** | P0 | Low | Copyable, clickable link |
| **Content preview** | P0 | Low | Show chunk text |
| **Contribution explanation** | P0 | Medium | Why this node was used |
| **Connected nodes list** | P1 | Medium | Show related nodes |
| **Panel slide animation** | P0 | Low | Smooth open/close |

#### Clustering Mode

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Toggle clustering** | P0 | Low | Button in top-right |
| **Tier-based repositioning** | P0 | High | Force-directed or concentric rings |
| **Tier color coding** | P0 | Medium | Green/Cyan/Purple/Blue |
| **Tier breakdown panel** | P0 | Low | Show tier counts |
| **Smooth reorganization** | P0 | Medium | Animated transition |

#### Performance & Accessibility

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **60fps 3D rendering** | P0 | Medium | Optimize scene complexity |
| **Reduced motion support** | P0 | Low | Respect prefers-reduced-motion |
| **Keyboard navigation** | P0 | Medium | Tab through nodes, Enter to select |
| **Screen reader support** | P0 | Medium | ARIA labels, live regions |
| **Mobile responsive** | P1 | High | Touch controls for 3D orbit |

---

### 🚀 V2 (Nice to Have)

#### Advanced Visualization

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Role-based node colors** | V2 | Medium | Principle/fact/example/analogy |
| **Node size by importance** | V2 | Low | Scale nodes by relevance score |
| **Edge thickness by strength** | V2 | Medium | Thicker = stronger relationship |
| **Mini-map / navigation aid** | V2 | Medium | Small 2D overview in corner |
| **Playback scrubber** | V2 | High | Replay reasoning steps |
| **Search nodes** | V2 | Medium | Filter/highlight by keyword |
| **Export graph** | V2 | Medium | PNG/SVG download |
| **Compare two answers** | V2 | High | Side-by-side graphs |

#### Enhanced Interactions

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Node annotations** | V2 | Medium | User-added notes on nodes |
| **Bookmark nodes** | V2 | Low | Save important sources |
| **Share graph link** | V2 | Medium | Unique URL per question |
| **Collaborative annotations** | V2 | High | Team comments |
| **VR/AR mode** | V2 | Very High | Immersive 3D exploration |

#### Customization

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Light mode** | V2 | Low | Invert color scheme |
| **Custom color themes** | V2 | Medium | User-defined palettes |
| **Layout presets** | V2 | Low | Hide sidebar, focus mode |
| **Font size controls** | V2 | Low | Accessibility |
| **Animation speed** | V2 | Low | Slow/normal/fast |

#### Intelligence Features

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Source credibility badges** | V2 | Medium | Trust indicators |
| **Conflicting sources highlight** | V2 | High | Show disagreements |
| **Reasoning path alternatives** | V2 | Very High | "AI could have also..." |
| **Fact-check integration** | V2 | High | Third-party verification |
| **Citation export** | V2 | Medium | Export as BibTeX, etc. |

#### Performance Enhancements

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **WebGPU rendering** | V2 | High | Next-gen graphics |
| **Level of Detail (LOD)** | V2 | Medium | Simplify distant nodes |
| **Instanced rendering** | V2 | Medium | For 100+ nodes |
| **Post-processing effects** | V2 | Medium | Bloom, depth of field |
| **Progressive loading** | V2 | Medium | Stream nodes as retrieved |

#### Analytics & Insights

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **Usage statistics** | V2 | Low | Questions asked, nodes clicked |
| **Source diversity metrics** | V2 | Medium | Show variety of sources |
| **Reasoning complexity score** | V2 | High | How complex was this answer? |
| **Explore similar questions** | V2 | High | Recommendation engine |

---

## Priority Definitions

| Level | Meaning | Criteria |
|-------|---------|----------|
| **P0** | Blocker | Without this, MVP doesn't work or loses core value |
| **P1** | High | Strongly recommended for MVP, enhances UX significantly |
| **V2** | Future | Valuable but can wait for post-launch iteration |

---

## Complexity Estimates

| Level | Time | Risk | Notes |
|-------|------|------|-------|
| **Low** | 1-3 days | Minimal | Well-understood patterns |
| **Medium** | 4-7 days | Some unknowns | May require iteration |
| **High** | 1-3 weeks | Significant | New territory, R&D needed |
| **Very High** | 1-2 months | High | Major feature, consider deferring |

---

## MVP Launch Checklist

### Pre-Launch (Must Complete)

- [ ] **Core Flow Works**: User can ask → see 3D graph → explore nodes
- [ ] **Performance**: Maintains 60fps with up to 20 nodes
- [ ] **Accessibility**: Keyboard navigable, screen reader friendly
- [ ] **Mobile**: Usable on tablets (phones optional)
- [ ] **Error Handling**: Graceful failures, helpful error messages
- [ ] **Loading States**: Clear feedback during AI generation
- [ ] **Empty States**: Onboarding for first-time users

### Post-Launch (Can Iterate)

- [ ] Multi-turn conversations (P1)
- [ ] Camera reset button (P1)
- [ ] Connected nodes list (P1)
- [ ] Mobile touch optimization (P1)

---

## V2 Prioritization Framework

### Decision Criteria

When deciding what V2 features to build next, ask:

1. **User Impact**: How many users requested this?
2. **Wow Factor**: Does it significantly enhance the "AI transparency" promise?
3. **Complexity**: Can we ship it in 2 weeks or less?
4. **Risk**: Is it technically proven or experimental?

### Suggested V2 Roadmap

**Phase 1 (Post-MVP, Month 1-2)**
- Playback scrubber (high demand, medium complexity)
- Role-based node colors (enhances understanding)
- Mini-map (helps with larger graphs)
- Export graph (user request)

**Phase 2 (Month 3-4)**
- Source credibility badges (trust building)
- Search nodes (power users)
- Light mode (accessibility)
- Share graph link (virality)

**Phase 3 (Month 5-6)**
- Compare two answers (research use case)
- Conflicting sources highlight (advanced transparency)
- Citation export (academic users)
- Collaborative annotations (team feature)

**Future / Experimental**
- VR/AR mode (R&D, niche audience)
- Reasoning path alternatives (very complex, unclear value)
- WebGPU rendering (only if performance becomes issue)

---

## Success Metrics by Phase

### MVP Success
- [ ] 80%+ users successfully complete first interaction
- [ ] Average session time >3 minutes
- [ ] Node click-through rate >15%
- [ ] Zero critical accessibility violations
- [ ] <2% bounce rate on performance issues

### V2 Success
- [ ] 40%+ return usage (users come back)
- [ ] Positive sentiment in 80%+ feedback
- [ ] 25%+ users enable clustering mode
- [ ] <5s average time to first node spawn
- [ ] Net Promoter Score (NPS) >50

---

## Technical Debt Considerations

### Acceptable in MVP
- Hardcoded tier calculations (can refine algorithm later)
- Simple spherical node layout (can add force-directed later)
- Single-threaded rendering (optimize in V2)
- Basic edge rendering (upgrade to Line2 later)

### Must Address in MVP
- Scalable state management (will need for multi-turn)
- Proper error boundaries (prevent white screen)
- Memory cleanup (avoid leaks on session switch)
- Secure API design (don't expose internals)

---

## Cut Line: Features to Defer

These were considered but explicitly cut from MVP:

| Feature | Why Deferred |
|---------|--------------|
| Light mode | 90% of target users prefer dark for research tools |
| Mobile phone support | 3D interactions poor on small screens, tablet-first |
| VR/AR | Experimental, small audience, very high complexity |
| Collaborative annotations | Requires auth, real-time sync, complex |
| Reasoning alternatives | Requires major AI model changes |
| Fact-check integration | Requires third-party API, adds latency |
| Progressive node loading | Premature optimization, MVP won't have 100+ nodes |

---

**Summary**: Ship MVP with 15-20 core features. Validate. Iterate to V2 based on user feedback and usage data.
