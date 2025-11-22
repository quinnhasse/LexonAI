# Component Library Specifications

## Overview

This document details all reusable UI components for the AI Thinking Graph interface. Each component includes structure, variants, states, and implementation notes.

---

## 1. Button

### Variants

#### Primary Button
```html
<button class="btn btn-primary">
  <span class="btn-icon">→</span>
  <span class="btn-label">Send</span>
</button>
```

```css
.btn-primary {
  height: 44px;
  padding: 0 24px;
  background: var(--accent-cyan);
  color: var(--bg-void);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--text-body-md);
  cursor: pointer;
  transition: all 150ms var(--ease-smooth);
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-glow-cyan);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover {
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-muted);
}
```

#### Icon Button
```html
<button class="btn-icon" aria-label="Reset camera">
  <svg>...</svg>
</button>
```

```css
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(26, 26, 34, 0.8);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms;
}

.btn-icon:hover {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: rgba(26, 26, 34, 0.95);
}
```

### States
- Default
- Hover
- Active (pressed)
- Disabled
- Loading (with spinner)

---

## 2. Input Field

### Text Input

```html
<div class="input-wrapper">
  <label for="chat-input" class="sr-only">Ask a question</label>
  <textarea
    id="chat-input"
    class="input-field"
    placeholder="Ask anything..."
    rows="1"
    autocomplete="off"
  ></textarea>
</div>
```

```css
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-field {
  width: 100%;
  min-height: 40px;
  max-height: 200px;
  padding: 12px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
  transition: border-color 200ms, box-shadow 200ms;
}

.input-field::placeholder {
  color: var(--text-tertiary);
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px rgba(77, 212, 212, 0.2);
}
```

### Auto-Resize Behavior

```javascript
const textarea = document.querySelector('.input-field');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
});
```

---

## 3. Chat History Item

```html
<div class="chat-item" data-chat-id="abc123">
  <div class="chat-content">
    <h4 class="chat-title">What causes the northern lights?</h4>
    <div class="chat-meta">
      <span class="chat-time">2 hours ago</span>
      <span class="chat-nodes">12 nodes</span>
    </div>
  </div>
  <button class="chat-delete" aria-label="Delete chat">
    <svg>...</svg>
  </button>
</div>
```

```css
.chat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 150ms;
}

.chat-item:hover {
  background: var(--interactive-hover);
}

.chat-item.active {
  background: var(--accent-cyan-muted);
  border-left: 3px solid var(--accent-cyan);
}

.chat-content {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.chat-title {
  font-size: 14px;
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.chat-delete {
  opacity: 0;
  width: 24px;
  height: 24px;
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: opacity 150ms, color 150ms;
}

.chat-item:hover .chat-delete {
  opacity: 1;
}

.chat-delete:hover {
  color: var(--state-error);
}
```

---

## 4. Panel (Sidebar & Right Panel)

### Structure

```html
<aside class="panel panel-left">
  <header class="panel-header">
    <h2>Chat History</h2>
  </header>

  <div class="panel-content">
    <!-- Scrollable content -->
  </div>

  <footer class="panel-footer">
    <button class="btn-secondary">Settings</button>
  </footer>
</aside>
```

```css
.panel {
  height: 100vh;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-left {
  width: 260px;
  border-right: 1px solid var(--border-subtle);
}

.panel-right {
  width: 380px;
  border-left: 1px solid var(--border-subtle);
  position: absolute;
  right: 0;
  top: 0;
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.panel-right.open {
  transform: translateX(0);
}

.panel-header {
  height: 64px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

/* Custom scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}

.panel-footer {
  height: 64px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
}
```

---

## 5. Node Detail Card (Right Panel Content)

```html
<div class="node-detail">
  <div class="node-header">
    <div class="node-icon" style="background: var(--cluster-tier1)">
      <svg>...</svg>
    </div>
    <div class="node-title-group">
      <span class="node-tier-label">Tier 1 - Direct Support</span>
      <h3 class="node-title">Solar Wind Article</h3>
    </div>
  </div>

  <div class="node-section">
    <h4 class="section-label">Source</h4>
    <a href="https://nasa.gov/..." class="node-url" target="_blank">
      nasa.gov/solar-wind
      <svg class="external-icon">...</svg>
    </a>
    <button class="copy-url" aria-label="Copy URL">
      <svg>...</svg>
    </button>
  </div>

  <div class="node-section">
    <h4 class="section-label">Content Preview</h4>
    <p class="node-content">
      Solar wind consists of charged particles...
    </p>
  </div>

  <div class="node-section">
    <h4 class="section-label">Contribution</h4>
    <p class="node-contribution">
      Directly supports the final answer's explanation of particle collision.
    </p>
  </div>

  <div class="node-section">
    <h4 class="section-label">Connected Nodes</h4>
    <div class="connected-nodes">
      <button class="connected-node-chip">
        <span class="chip-dot tier-2"></span>
        Magnetosphere Article
      </button>
      <button class="connected-node-chip">
        <span class="chip-dot tier-2"></span>
        Aurora Science
      </button>
    </div>
  </div>
</div>
```

```css
.node-detail {
  padding: 0 24px 24px 24px;
}

.node-header {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-title-group {
  flex: 1;
}

.node-tier-label {
  display: block;
  font-size: 11px;
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.node-title {
  font-size: 18px;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.node-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 12px;
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin: 0 0 8px 0;
}

.node-url {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-cyan);
  text-decoration: none;
  font-size: 14px;
  transition: color 150ms;
}

.node-url:hover {
  color: var(--accent-purple);
  text-decoration: underline;
}

.node-content,
.node-contribution {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.connected-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.connected-node-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 150ms;
}

.connected-node-chip:hover {
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-muted);
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chip-dot.tier-1 { background: var(--cluster-tier1); }
.chip-dot.tier-2 { background: var(--cluster-tier2); }
.chip-dot.tier-3 { background: var(--cluster-tier3); }
.chip-dot.tier-4 { background: var(--cluster-tier4); }
```

---

## 6. Tooltip

```html
<div class="tooltip" role="tooltip">
  <div class="tooltip-content">
    Solar Wind Article
  </div>
  <div class="tooltip-arrow"></div>
</div>
```

```css
.tooltip {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transition: opacity 150ms;
}

.tooltip.visible {
  opacity: 1;
}

.tooltip-content {
  background: rgba(19, 19, 24, 0.95);
  backdrop-filter: blur(8px);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-primary);
  max-width: 240px;
  box-shadow: var(--shadow-md);
}

.tooltip-arrow {
  width: 8px;
  height: 8px;
  background: rgba(19, 19, 24, 0.95);
  border: 1px solid var(--border-default);
  border-width: 0 1px 1px 0;
  transform: rotate(45deg);
  position: absolute;
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
}
```

### JavaScript Usage

```javascript
const tooltip = document.querySelector('.tooltip');

function showTooltip(text, x, y) {
  tooltip.querySelector('.tooltip-content').textContent = text;
  tooltip.style.left = x + 'px';
  tooltip.style.top = (y - 40) + 'px'; // Position above cursor
  tooltip.classList.add('visible');
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}
```

---

## 7. Toggle Switch (Clustering)

```html
<div class="toggle-control">
  <label class="toggle-label" for="clustering-toggle">
    Clustering
  </label>
  <button
    id="clustering-toggle"
    class="toggle"
    role="switch"
    aria-checked="false"
  >
    <span class="toggle-track">
      <span class="toggle-thumb"></span>
    </span>
  </button>
</div>
```

```css
.toggle-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(26, 26, 34, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.toggle-label {
  font-size: 14px;
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.toggle {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: var(--bg-elevated);
  border: 2px solid var(--border-default);
  border-radius: 12px;
  position: relative;
  transition: all 200ms;
}

.toggle-thumb {
  display: block;
  width: 16px;
  height: 16px;
  background: var(--text-secondary);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle[aria-checked="true"] .toggle-track {
  background: var(--accent-cyan-muted);
  border-color: var(--accent-cyan);
}

.toggle[aria-checked="true"] .toggle-thumb {
  background: var(--accent-cyan);
  left: 22px;
}
```

---

## 8. Loading State

### Thinking Indicator

```html
<div class="thinking-indicator">
  <div class="thinking-dots">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>
  <span class="thinking-label">Thinking...</span>
</div>
```

```css
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(26, 26, 34, 0.9);
  border-radius: var(--radius-lg);
}

.thinking-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--accent-cyan);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.thinking-label {
  font-size: 14px;
  color: var(--text-secondary);
}
```

---

## 9. Empty State

```html
<div class="empty-state">
  <div class="empty-icon">
    <svg>...</svg>
  </div>
  <h3 class="empty-title">Ask anything to reveal the AI's thinking</h3>
  <p class="empty-description">
    Your question will generate a 3D graph showing how the AI reasons through sources.
  </p>
  <div class="empty-suggestions">
    <button class="suggestion-chip">Explain quantum computing</button>
    <button class="suggestion-chip">How do vaccines work?</button>
    <button class="suggestion-chip">What causes earthquakes?</button>
  </div>
</div>
```

```css
.empty-state {
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 24px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: var(--accent-cyan);
  opacity: 0.4;
}

.empty-title {
  font-size: 22px;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

.empty-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.suggestion-chip {
  padding: 10px 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 150ms;
}

.suggestion-chip:hover {
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-muted);
}
```

---

## Component Usage Matrix

| Component | Sidebar | Right Panel | Globe Canvas | Input Bar |
|-----------|---------|-------------|--------------|-----------|
| Button | ✓ | ✓ | ✓ (overlay) | ✓ |
| Input Field | - | - | - | ✓ |
| Chat History Item | ✓ | - | - | - |
| Panel | ✓ | ✓ | - | - |
| Node Detail Card | - | ✓ | - | - |
| Tooltip | - | - | ✓ (hover) | - |
| Toggle Switch | - | - | ✓ (overlay) | - |
| Loading State | - | ✓ | ✓ | - |
| Empty State | - | - | ✓ | - |

---

**Next**: MVP vs V2 Feature Breakdown →
