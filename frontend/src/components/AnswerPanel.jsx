import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function AnswerPanel({ show, answer, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (show && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [show, answer]);

  if (!show || !answer) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-full md:w-[500px] animate-slide-in-right z-10">
      <div className="h-full glass-strong border-l border-white/10 flex flex-col backdrop-blur-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30">
                <Sparkles className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">AI Response</h2>
                <p className="text-sm text-white/50 mt-0.5">Generated just now</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={panelRef} className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Answer content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-white/90 leading-relaxed space-y-4">
              {answer.content.split('\n\n').map((paragraph, idx) => {
                // Check if it's a heading (starts with #)
                if (paragraph.startsWith('#')) {
                  const level = paragraph.match(/^#+/)[0].length;
                  const text = paragraph.replace(/^#+\s*/, '');

                  if (level === 1) {
                    return (
                      <h1 key={idx} className="text-2xl font-display font-bold text-white mt-6 mb-3">
                        {text}
                      </h1>
                    );
                  } else if (level === 2) {
                    return (
                      <h2 key={idx} className="text-xl font-display font-semibold text-white mt-5 mb-2">
                        {text}
                      </h2>
                    );
                  }
                }

                // Check if it's a numbered list item
                if (/^\d+\./.test(paragraph)) {
                  const match = paragraph.match(/^(\d+\.)\s*\*\*(.+?)\*\*:\s*(.+)/);
                  if (match) {
                    return (
                      <div key={idx} className="flex gap-3 mb-3">
                        <span className="text-neon-cyan font-bold flex-shrink-0">{match[1]}</span>
                        <div>
                          <span className="text-white font-semibold">{match[2]}:</span>
                          <span className="text-white/80"> {match[3]}</span>
                        </div>
                      </div>
                    );
                  }
                }

                // Regular paragraph - handle bold text
                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={idx} className="text-white/80 leading-relaxed">
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={i} className="text-white font-semibold">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Sources */}
          {answer.sources && answer.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Sources
              </h3>
              <div className="space-y-2">
                {answer.sources.map((source, idx) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 glass rounded-lg border border-white/10 hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center text-xs font-bold text-neon-cyan">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                          {source.name}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-neon-cyan transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Generated in 2.3s</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>High confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <button className="flex-1 btn-glass text-sm py-2">
              Copy Response
            </button>
            <button className="flex-1 btn-glass text-sm py-2">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
