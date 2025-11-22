import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Sidebar({ conversations, activeConversation, onSelectConversation, onNewConversation }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`relative h-full glass-strong border-r border-white/10 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      } flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <h1 className="text-lg font-display font-bold text-gradient-cyan-purple">
              Neural AI
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white/70 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className={`w-full btn-glass flex items-center justify-center gap-2 ${
            isCollapsed ? 'px-3 py-3' : 'px-4 py-3'
          }`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New Conversation</span>}
        </button>
      </div>

      {/* Conversations List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  activeConversation === conv.id
                    ? 'bg-neon-cyan/20 border border-neon-cyan/50 glow-cyan'
                    : 'glass hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      activeConversation === conv.id ? 'text-neon-cyan' : 'text-white/50'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        activeConversation === conv.id ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {conv.title}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{formatTimestamp(conv.timestamp)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 text-center">
            <p>Neural Network Visualizer</p>
            <p className="mt-1">Powered by AI</p>
          </div>
        </div>
      )}
    </div>
  );
}
