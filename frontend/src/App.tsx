import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputBar } from './components/InputBar';
import { ThinkingGlobe } from './components/ThinkingGlobe';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { ControlsPanel } from './components/ControlsPanel';
import type {
  ChatSession,
  KnowledgeNode,
  Connection,
  ViewMode,
  ClusteringMode,
} from './types';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [clusteringMode, setClusteringMode] = useState<ClusteringMode>('none');

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      timestamp: new Date(),
      question: '',
      answer: {
        text: '',
        isGenerating: false,
        currentStep: 0,
        totalSteps: 0,
      },
      nodes: [],
      connections: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setViewMode('idle');
    setSelectedNode(null);
  };

  const handleSubmitQuestion = async (question: string) => {
    if (!activeSessionId) {
      handleNewChat();
      return;
    }

    // Update session with question
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              question,
              title: question.slice(0, 50) + (question.length > 50 ? '...' : ''),
            }
          : s
      )
    );

    // Simulate AI thinking
    setViewMode('thinking');
    await simulateAIThinking(question);
  };

  const simulateAIThinking = async (question: string) => {
    // Generate mock nodes in 3D space around the center
    const numNodes = 8 + Math.floor(Math.random() * 5);
    const nodes: KnowledgeNode[] = [];
    const connections: Connection[] = [];

    for (let i = 0; i < numNodes; i++) {
      const theta = (i / numNodes) * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const tier = i < 3 ? 1 : i < 6 ? 2 : 3;

      nodes.push({
        id: `node-${i}`,
        position: [x, y, z],
        title: `Source ${i + 1}: ${getRandomSource()}`,
        sourceUrl: `https://example.com/source-${i + 1}`,
        chunkText: getRandomChunkText(),
        whyUsed: getRandomWhyUsed(),
        isActive: false,
        tier,
        role: getRandomRole(),
      });

      // Connect to answer core (center)
      if (i < 6) {
        connections.push({
          from: `node-${i}`,
          to: 'answer-core',
          strength: Math.random() * 0.5 + 0.5,
          isActive: false,
        });
      }

      // Connect some nodes to each other
      if (i > 0 && Math.random() > 0.5) {
        connections.push({
          from: `node-${i}`,
          to: `node-${Math.floor(Math.random() * i)}`,
          strength: Math.random() * 0.3 + 0.2,
          isActive: false,
        });
      }
    }

    // Animate nodes appearing one by one
    for (let i = 0; i < nodes.length; i++) {
      await sleep(300);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                nodes: nodes.slice(0, i + 1),
                connections: connections.filter((c) =>
                  nodes.slice(0, i + 1).some((n) => n.id === c.from)
                ),
              }
            : s
        )
      );
    }

    // Simulate answer generation with step-by-step activation
    const answer = getRandomAnswer(question);
    const steps = nodes.length;

    for (let step = 0; step <= steps; step++) {
      await sleep(500);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                answer: {
                  text: step === steps ? answer : 'Analyzing sources...',
                  isGenerating: step < steps,
                  currentStep: step,
                  totalSteps: steps,
                },
                nodes: s.nodes.map((n, i) => ({
                  ...n,
                  isActive: i < step,
                })),
                connections: s.connections.map((c) => ({
                  ...c,
                  isActive: step > steps / 2,
                })),
              }
            : s
        )
      );
    }

    setViewMode('exploring');
  };

  // Initialize with a demo session
  useEffect(() => {
    if (sessions.length === 0) {
      handleNewChat();
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-cyber-darker overflow-hidden flex">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-50" />

        {/* 3D Globe */}
        <ThinkingGlobe
          nodes={activeSession?.nodes || []}
          connections={activeSession?.connections || []}
          answerCore={activeSession?.answer || null}
          viewMode={viewMode}
          clusteringMode={clusteringMode}
          onNodeClick={setSelectedNode}
          onNodeHover={() => {}}
        />

        {/* Controls Panel */}
        <ControlsPanel
          clusteringMode={clusteringMode}
          onClusteringModeChange={setClusteringMode}
        />

        {/* Input Bar */}
        <InputBar
          onSubmit={handleSubmitQuestion}
          isGenerating={activeSession?.answer.isGenerating || false}
        />

        {/* Node Detail Panel */}
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
}

// Helper functions
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sources = [
  'Quantum Computing Principles',
  'Neural Network Architecture',
  'Machine Learning Fundamentals',
  'Deep Learning Research',
  'AI Ethics Guidelines',
  'Data Science Methods',
  'Computer Vision Techniques',
  'Natural Language Processing',
  'Reinforcement Learning',
  'Transformer Models',
];

function getRandomSource() {
  return sources[Math.floor(Math.random() * sources.length)];
}

function getRandomChunkText() {
  const texts = [
    'This source provides fundamental concepts about the underlying principles and methodologies. The content discusses key aspects that are essential for understanding the broader context.',
    'Research shows that this approach has been validated through multiple studies and practical applications. The evidence suggests strong correlation with theoretical frameworks.',
    'The implementation details outlined here demonstrate practical applications of the concept. These methods have been tested and refined over multiple iterations.',
    'Historical context reveals the evolution of this idea and its impact on current practices. Understanding this background is crucial for proper application.',
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}

function getRandomWhyUsed() {
  const reasons = [
    'Provides foundational context for the main answer',
    'Offers supporting evidence and validation',
    'Presents practical examples and applications',
    'Gives historical perspective and background',
    'Explains core principles and methodologies',
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getRandomRole(): 'principle' | 'fact' | 'example' | 'analogy' {
  const roles: Array<'principle' | 'fact' | 'example' | 'analogy'> = [
    'principle',
    'fact',
    'example',
    'analogy',
  ];
  return roles[Math.floor(Math.random() * roles.length)];
}

function getRandomAnswer(question: string) {
  return `Based on the analysis of multiple sources, here's a comprehensive answer to "${question}":

The key insight is that this topic involves multiple interconnected concepts that build upon each other. The sources reveal a pattern of progressive understanding, where foundational principles support more advanced applications.

The evidence suggests that a multi-faceted approach, combining theoretical frameworks with practical implementations, yields the most robust results. This is supported by research across different domains and validated through empirical studies.`;
}

export default App;
