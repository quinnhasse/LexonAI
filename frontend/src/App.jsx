import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Globe from './components/Globe';
import ChatInput from './components/ChatInput';
import AnswerPanel from './components/AnswerPanel';
import { useChat } from './hooks/useChat';

function App() {
  const {
    conversations,
    activeConversation,
    messages,
    nodes,
    isLoading,
    showAnswer,
    currentAnswer,
    sendMessage,
    createNewConversation,
    selectConversation,
  } = useChat();

  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    console.log('Node clicked:', node);
  };

  const handleCloseAnswer = () => {
    // We don't modify showAnswer here, as it's controlled by the chat hook
    // But we can add custom logic if needed
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-dark-bg flex">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-3xl" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 w-full h-full flex">
        {/* Left Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={selectConversation}
          onNewConversation={createNewConversation}
        />

        {/* Center content area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Top header */}
          <div className="glass-subtle border-b border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-semibold text-white">
                  Neural Network Visualization
                </h2>
                <p className="text-sm text-white/50 mt-0.5">
                  {isLoading
                    ? 'AI is thinking...'
                    : nodes.length > 1
                    ? `${nodes.length} nodes connected`
                    : 'Ask a question to begin'}
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-neon-purple animate-glow-pulse' : 'bg-neon-green'}`} />
                <span className="text-xs text-white/50">
                  {isLoading ? 'Processing' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* 3D Globe Canvas */}
          <div className="flex-1 relative">
            <Globe nodes={nodes} onNodeClick={handleNodeClick} />

            {/* Welcome message overlay (shown when no messages) */}
            {messages.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-2xl px-8 animate-fade-in">
                  <h1 className="text-5xl font-display font-bold text-gradient-cyan-purple mb-4">
                    Neural AI Visualizer
                  </h1>
                  <p className="text-xl text-white/60 mb-8">
                    Ask any question and watch the AI's thought process unfold in 3D
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      'Visualize knowledge connections',
                      'See AI reasoning in real-time',
                      'Explore answer sources',
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        className="glass px-6 py-4 rounded-xl border border-white/10 backdrop-blur-md"
                      >
                        <p className="text-sm text-white/70">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 animate-scale-in">
                <div className="glass-strong px-6 py-3 rounded-full border border-neon-purple/50 glow-purple">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm font-medium text-white">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom input */}
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>

        {/* Right Answer Panel */}
        <AnswerPanel show={showAnswer} answer={currentAnswer} onClose={handleCloseAnswer} />
      </div>
    </div>
  );
}

export default App;
