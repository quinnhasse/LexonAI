// Color scheme
export const COLORS = {
  neonCyan: '#22d3ee',
  neonPurple: '#8b5cf6',
  neonPink: '#ec4899',
  neonGreen: '#10b981',
  darkBg: '#0a0a0f',
  darkSurface: '#141420',
  darkElevated: '#1a1a2e',
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 600,
};

// Node types for the globe
export const NODE_TYPES = {
  ANSWER_CORE: 'answer_core',
  GENERATING: 'generating',
  SOURCE: 'source',
  CLUSTER: 'cluster',
};

// Node states
export const NODE_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  THINKING: 'thinking',
  COMPLETE: 'complete',
};

// Cluster tiers (for visual hierarchy)
export const CLUSTER_TIERS = {
  PRIMARY: {
    name: 'primary',
    color: COLORS.neonPurple,
    size: 1.2,
  },
  SECONDARY: {
    name: 'secondary',
    color: COLORS.neonCyan,
    size: 1.0,
  },
  TERTIARY: {
    name: 'tertiary',
    color: COLORS.neonGreen,
    size: 0.8,
  },
};

// Sample data for demo
export const SAMPLE_NODES = [
  {
    id: 'answer-core',
    type: NODE_TYPES.ANSWER_CORE,
    label: 'Answer Core',
    position: [0, 0, 0],
    state: NODE_STATES.IDLE,
  },
];

export const SAMPLE_CONVERSATIONS = [
  {
    id: '1',
    title: 'What is quantum computing?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    title: 'Explain neural networks',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    title: 'How does blockchain work?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];
