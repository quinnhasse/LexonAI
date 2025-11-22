import { useState } from 'react';
import { MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ sessions, activeSessionId, onSessionSelect, onNewChat }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      className="relative h-full glass-panel border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 transition-all group"
            >
              <Plus className="w-5 h-5 text-cyber-blue group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-medium">New Chat</span>
            </motion.button>
          )}
        </AnimatePresence>
        {isCollapsed && (
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 transition-all"
          >
            <Plus className="w-5 h-5 text-cyber-blue" />
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onSessionSelect(session.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg mb-2 transition-all ${
                activeSessionId === session.id
                  ? 'bg-white/10 border border-white/20'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {!isCollapsed && (
                <>
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyber-blue" />
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm text-white/90 truncate">{session.title}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
              {isCollapsed && (
                <MessageSquare className="w-4 h-4 text-cyber-blue mx-auto" />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyber-grey border border-white/20 flex items-center justify-center hover:bg-cyber-blue/20 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.div>
  );
}
