import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { KnowledgeNode } from '../types';

interface NodeDetailPanelProps {
  node: KnowledgeNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (node?.sourceUrl) {
      navigator.clipboard.writeText(node.sourceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-96 glass-panel border-l border-white/10 flex flex-col z-50"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-white mb-1">{node.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(node.tier)}`}>
                  Tier {node.tier}
                </span>
                {node.role && (
                  <span className="text-xs px-2 py-1 rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                    {node.role}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Why Used */}
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-2">Why This Source?</h4>
              <p className="text-sm text-white/90 leading-relaxed">{node.whyUsed}</p>
            </div>

            {/* Chunk Text */}
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-2">Source Content</h4>
              <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {node.chunkText}
                </p>
              </div>
            </div>

            {/* Source URL */}
            {node.sourceUrl && (
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-2">Source Link</h4>
                <div className="flex items-center gap-2">
                  <a
                    href={node.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-cyber-blue hover:text-cyber-blue/80 truncate flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{node.sourceUrl}</span>
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getTierColor(tier: number): string {
  switch (tier) {
    case 1:
      return 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30';
    case 2:
      return 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30';
    default:
      return 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30';
  }
}
