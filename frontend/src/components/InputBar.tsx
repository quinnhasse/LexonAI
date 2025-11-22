import { useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputBarProps {
  onSubmit: (question: string) => void;
  isGenerating: boolean;
}

export function InputBar({ onSubmit, isGenerating }: InputBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="glass-panel rounded-2xl shadow-2xl p-4">
          <div className="flex items-end gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isGenerating}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-white placeholder-white/40 disabled:opacity-50 max-h-32 min-h-[24px]"
              style={{
                height: 'auto',
                minHeight: '24px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isGenerating
                  ? 'bg-cyber-blue hover:bg-cyber-blue/80 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-white/40 mt-3">
          Press <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/60">Enter</kbd> to send,{' '}
          <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/60">Shift + Enter</kbd> for new line
        </p>
      </motion.div>
    </div>
  );
}
