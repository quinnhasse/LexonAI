# AI Thinking Globe - Frontend

A stunning 3D visualization interface that reveals an AI's reasoning process in real-time. Built with React, Three.js, and modern web technologies.

## 🌟 Features

### Core Functionality
- **ChatGPT-like Interface**: Familiar chat interface with sidebar history and bottom input bar
- **3D Thinking Visualization**: Real-time 3D globe showing AI reasoning as interconnected nodes
- **Node Exploration**: Click nodes to view source details, hover for quick previews
- **Clustering Mode**: Visualize nodes by tier (proximity to answer) with color coding
- **Smooth Animations**: Fluid camera movements, node spawning, and highlight effects
- **Dark Cyber Aesthetic**: High-contrast dark theme with neon accents

### Visual Components
1. **Left Sidebar**
   - Chat history with collapsible interface
   - "New Chat" button
   - Session management

2. **3D Globe (Center)**
   - Rotating knowledge universe in idle state
   - Answer Core block at center
   - Knowledge nodes positioned in 3D space
   - Connection lines showing relationships
   - Real-time node activation during answer generation

3. **Controls Panel (Top Right)**
   - Default/Tier clustering toggle
   - Tier legend when clustering is active

4. **Input Bar (Bottom)**
   - ChatGPT-style text input
   - Auto-expanding textarea
   - Keyboard shortcuts (Enter to send, Shift+Enter for new line)

5. **Node Detail Panel (Right)**
   - Slides in when node is clicked
   - Shows source title, tier, role
   - Displays chunk text and "why used" explanation
   - Copyable source URLs

## 🎨 Design System

### Color Palette
- `cyber-darker`: #050810 (Background)
- `cyber-dark`: #0a0e1a (Panels)
- `cyber-grey`: #1e293b (Glass panels)
- `cyber-blue`: #00d4ff (Primary accent)
- `cyber-green`: #10b981 (Tier 1 nodes)
- `cyber-purple`: #a855f7 (Tier 3+ nodes)

### Tier Color Coding
- **Tier 1 (Green)**: Direct support for the answer
- **Tier 2 (Blue)**: Supporting sources
- **Tier 3+ (Purple)**: Background context

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Framer Motion** - Smooth animations
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Icon library

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Chat history sidebar
│   │   ├── InputBar.tsx          # Bottom input component
│   │   ├── ThinkingGlobe.tsx     # Main 3D visualization
│   │   ├── NodeDetailPanel.tsx   # Node details drawer
│   │   ├── ControlsPanel.tsx     # Visualization controls
│   │   └── index.ts              # Component exports
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## 🎭 Component Guide

### ThinkingGlobe
The main 3D visualization component with several sub-components:
- `GlobeShell`: Outer rotating sphere with grid
- `AnswerCoreBox`: Central answer display
- `NodesLayer`: Manages all knowledge nodes
- `KnowledgeNodeMesh`: Individual node with interactions
- `ConnectionsLayer`: Manages node connections
- `ConnectionLine`: Individual connection line

### State Management
Uses React hooks for local state:
- `sessions`: Array of chat sessions
- `activeSessionId`: Current session ID
- `selectedNode`: Node clicked for details
- `viewMode`: 'idle' | 'thinking' | 'exploring'
- `clusteringMode`: 'none' | 'tiers'

## 🔮 Demo Mode

The app includes a demo simulation that:
1. Generates 8-12 random nodes in 3D space
2. Animates nodes appearing one by one
3. Simulates AI thinking with step-by-step activation
4. Shows final answer after all nodes are processed

Replace `simulateAIThinking()` with real API calls for production.

## 🎯 Customization

### Adding New Node Roles
Edit the `KnowledgeNode` interface in `src/types/index.ts`:
```typescript
role?: 'principle' | 'fact' | 'example' | 'analogy' | 'your-new-role';
```

### Adjusting Colors
Modify `tailwind.config.js`:
```javascript
colors: {
  'cyber-dark': '#your-color',
  // ... add more colors
}
```

### Changing Node Layout
Modify the position calculation in `simulateAIThinking()`:
```typescript
// Current: Spherical distribution
const theta = (i / numNodes) * Math.PI * 2;
const phi = Math.acos(2 * Math.random() - 1);
```

## 📱 Responsive Design

The interface is optimized for desktop (1920x1080+). For mobile support:
1. Adjust sidebar to bottom drawer
2. Add touch controls for 3D navigation
3. Simplify node detail panel

## 🔌 Backend Integration

To connect to a real backend:

1. Replace mock data in `simulateAIThinking()` with API calls
2. Use WebSocket or SSE for real-time updates
3. Structure your API response to match the `KnowledgeNode` interface

Example API integration:
```typescript
const handleSubmitQuestion = async (question: string) => {
  const response = await fetch('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });

  const stream = response.body;
  // Process streaming response...
};
```

## 🎨 Animation Timing

- Node spawn delay: 300ms
- Answer step delay: 500ms
- Panel slide duration: ~200ms (spring animation)
- Globe idle rotation: 0.001 rad/frame

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### 3D Performance
- Reduce number of nodes
- Decrease sphere geometry segments
- Disable shadows and post-processing

### TypeScript Errors
- Run `npm run build` to see all errors
- Check type imports use `type` keyword
- Verify all interfaces match usage

## 📄 License

MIT

## 🙏 Credits

Built with modern web technologies for the MadHacks 2025 hackathon.
