import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="w-full glass-strong border-t border-white/10 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass border border-neon-cyan/30 rounded-2xl overflow-hidden focus-within:border-neon-cyan focus-within:glow-cyan transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the universe of knowledge..."
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-white placeholder-white/40 px-6 py-4 pr-14 resize-none outline-none text-base"
              style={{ maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/30 transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Hint text */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/30">
            <span>Press <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">Enter</kbd> to send</span>
            <span>•</span>
            <span><kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">Shift + Enter</kbd> for new line</span>
          </div>
        </form>
      </div>
    </div>
  );
}
