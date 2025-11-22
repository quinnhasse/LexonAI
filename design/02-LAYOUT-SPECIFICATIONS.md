# Layout Specifications

## Master Layout Architecture

### Full Screen Grid

```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar]  │    [3D Globe Canvas]    │ [Right Panel]  │
│             │                          │                │
│   260px     │      flex-grow           │  380px         │
│             │                          │  (optional)    │
│             │                          │                │
│             │                          │                │
│             │                          │                │
│             ├──────────────────────────┤                │
│             │   [Bottom Input Bar]     │                │
│             │       max-w: 840px       │                │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Layout Change |
|------------|---------------|
| < 768px | Sidebar collapses to icon bar (60px), right panel hidden |
| 768px - 1024px | Standard layout, right panel hidden by default |
| 1024px - 1280px | Full layout, right panel shown on demand |
| > 1280px | Full layout, all panels visible |

---

## Left Sidebar (Chat History)

### Dimensions
```css
width: 260px;
height: 100vh;
background: var(--bg-surface);
border-right: 1px solid var(--border-subtle);
z-index: 100;
```

### Internal Structure

```
┌──────────────────────────┐
│  [Logo Area]             │  → 64px height
├──────────────────────────┤
│  [+ New Chat Button]     │  → 48px height + 16px margin
├──────────────────────────┤
│                          │
│  [Chat History List]     │  → flex-grow, scroll
│   · Today                │     (overflow-y-auto)
│     - Previous chat 1    │
│     - Previous chat 2    │
│   · Yesterday            │
│     - Previous chat 3    │
│                          │
├──────────────────────────┤
│  [User Settings]         │  → 64px height
│   [Profile] [Settings]   │
└──────────────────────────┘
```

### Components

#### Logo Area
```
Height: 64px
Padding: 20px 24px
Content: App logo/wordmark + version tag
```

#### New Chat Button
```
Width: calc(100% - 32px)
Height: 44px
Margin: 16px
Border-radius: var(--radius-lg)
Background: var(--accent-cyan)
Text: "New Chat" + kbd icon
Hover: scale(1.02), shadow-glow-cyan
```

#### Chat History Item
```
Height: auto (min 56px)
Padding: 12px 16px
Border-radius: var(--radius-md)
Margin: 4px 8px

States:
- Default: bg transparent, text-secondary
- Hover: bg var(--interactive-hover)
- Active: bg var(--accent-cyan-muted), border-l cyan
```

Structure per item:
```html
<div class="chat-item">
  <div class="chat-title">Question preview (truncate 1 line)</div>
  <div class="chat-meta">
    <span class="timestamp">2 hours ago</span>
    <span class="node-count">12 nodes</span>
  </div>
</div>
```

#### Collapsed State (< 768px)
```
Width: 60px
Show only: Logo icon + New chat icon button
History hidden, available via hover/click expansion
```

---

## Center Canvas (3D Globe)

### Dimensions
```css
width: calc(100vw - sidebar-width - panel-width);
height: 100vh;
position: relative;
background: var(--bg-void);
overflow: hidden;
```

### Layers (z-index stack)

1. **Background Layer** (z: 0)
   - Canvas element for Three.js
   - Subtle noise texture
   - Optional grid overlay

2. **Globe Layer** (z: 1)
   - 3D scene rendering
   - Camera controls enabled
   - Fog + post-processing

3. **UI Overlay Layer** (z: 10)
   - Clustering toggle (top-right)
   - Camera reset button (top-right)
   - Loading states
   - Tooltips (follow cursor)

4. **Input Bar Layer** (z: 20)
   - Bottom-centered input
   - Floats above globe

### Globe Canvas Specs

```css
canvas {
  width: 100%;
  height: calc(100vh - var(--input-height));
  display: block;
  cursor: grab; /* or 'move' when orbiting */
}

canvas:active {
  cursor: grabbing;
}
```

### Input Bar Container

```
┌────────────────────────────────────────┐
│                                        │
│  [Globe Canvas Area]                   │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Text Input]  [Send Button]    │  │ ← Bottom input
│  └──────────────────────────────────┘  │
│           max-width: 840px             │
└────────────────────────────────────────┘
```

Position:
```css
position: absolute;
bottom: 24px;
left: 50%;
transform: translateX(-50%);
width: 100%;
max-width: 840px;
padding: 0 24px;
z-index: 20;
```

Input Component:
```css
height: 64px;
background: rgba(26, 26, 34, 0.9);
backdrop-filter: blur(16px);
border: 1px solid var(--border-default);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-lg);
padding: 12px 16px 12px 20px;

display: flex;
align-items: center;
gap: 12px;
```

Structure:
```html
<div class="input-container">
  <textarea
    placeholder="Ask anything..."
    rows="1"
    class="input-field"
  />
  <button class="send-button">
    <SendIcon />
  </button>
</div>
```

---

## Right Panel (Node Details / Sources)

### Dimensions
```css
width: 380px;
height: 100vh;
background: var(--bg-surface);
border-left: 1px solid var(--border-subtle);
z-index: 100;

/* Slide-in animation */
transform: translateX(100%);
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### States
- **Hidden**: `transform: translateX(100%)`
- **Visible**: `transform: translateX(0)`

### Internal Structure

```
┌────────────────────────────┐
│  [Panel Header]            │  → 64px
│   Title + Close button     │
├────────────────────────────┤
│                            │
│  [Content Area]            │  → flex-grow, scroll
│                            │
│  Conditional render:       │
│   - Node details view      │
│   - Clustering controls    │
│   - Settings panel         │
│                            │
├────────────────────────────┤
│  [Action Bar]              │  → 72px (optional)
│   Primary action button    │
└────────────────────────────┘
```

### Panel Header
```css
height: 64px;
padding: 20px 24px;
border-bottom: 1px solid var(--border-subtle);
display: flex;
justify-content: space-between;
align-items: center;
```

### Content Types

#### Node Detail View
Shows when user clicks a node:
```
┌────────────────────────┐
│ [Node Icon + Title]    │
│  "Supporting Evidence" │
├────────────────────────┤
│ Source:                │
│  → URL (copyable)      │
│  → Open in new tab ↗   │
├────────────────────────┤
│ Content Preview:       │
│  [Chunk text...]       │
│  (scrollable)          │
├────────────────────────┤
│ Contribution:          │
│  "Directly supports    │
│   final answer's..."   │
├────────────────────────┤
│ Connected Nodes:       │
│  • Node A →            │
│  • Node B →            │
└────────────────────────┘
```

#### Clustering Controls
Shows when clustering mode active:
```
┌────────────────────────┐
│ Clustering Mode ON     │
│  [Toggle Off]          │
├────────────────────────┤
│ Tier Breakdown:        │
│  ● Tier 1: 4 nodes     │
│  ● Tier 2: 7 nodes     │
│  ● Tier 3: 3 nodes     │
├────────────────────────┤
│ Color Legend:          │
│  🟢 Direct Support     │
│  🔵 Supporting         │
│  🟣 Background         │
└────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 1024px | Hidden by default, slides over globe when opened |
| > 1024px | Can be pinned open, pushes globe layout |

---

## Overlay UI Elements

### Clustering Toggle (Top-Right)

Position:
```css
position: absolute;
top: 24px;
right: 24px;
z-index: 15;
```

Component:
```html
<button class="clustering-toggle">
  <span class="icon">📊</span>
  <span class="label">Clustering</span>
  <span class="state">OFF</span>
</button>
```

Style:
```css
height: 40px;
padding: 8px 16px;
background: rgba(26, 26, 34, 0.8);
backdrop-filter: blur(12px);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
```

### Camera Reset Button

Position: Below clustering toggle
```css
top: 76px;
right: 24px;
```

Icon-only button:
```css
width: 40px;
height: 40px;
border-radius: var(--radius-md);
```

### Node Tooltip (Floating)

Follows cursor on node hover:
```css
position: fixed; /* follows mouse */
pointer-events: none;
z-index: 50;

background: rgba(19, 19, 24, 0.95);
backdrop-filter: blur(8px);
padding: 8px 12px;
border-radius: var(--radius-md);
border: 1px solid var(--border-default);

max-width: 240px;
font-size: 13px;
line-height: 1.4;
```

---

## Loading & Empty States

### Initial Load (No Chat)
```
Center of globe canvas:
┌────────────────────────────┐
│   [Logo/Icon]              │
│                            │
│   "Ask anything to reveal  │
│    the AI's thinking"      │
│                            │
│   [Quick prompts below?]   │
└────────────────────────────┘
```

### Thinking State
```
- Globe dimmed slightly
- Pulsing "Thinking..." text near Answer Core spawn point
- Subtle rotation acceleration
```

### Error State
```
- Red border on input
- Error message above input bar
- Globe returns to idle
```

---

## Spacing & Padding Standards

### Container Padding
```css
/* Sidebar inner padding */
padding: 0 8px;

/* Panel inner padding */
padding: 0 24px;

/* Section spacing */
margin-bottom: var(--space-6);
```

### Component Gaps
```css
/* Between UI elements */
gap: var(--space-4); /* 16px */

/* Between sections */
gap: var(--space-8); /* 32px */
```

---

## Accessibility Layout Notes

### Skip Links
Provide skip navigation at top:
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
<a href="#chat-input" class="skip-link">
  Skip to input
</a>
```

### Focus Trap
When right panel open, trap focus within panel until closed.

### Keyboard Shortcuts
- `Ctrl+N`: New chat
- `Ctrl+K`: Focus input
- `Escape`: Close panels / deselect nodes
- `R`: Reset camera
- `C`: Toggle clustering

---

**Next**: Component Library Specifications →
