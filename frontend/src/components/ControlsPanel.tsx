import { motion } from 'framer-motion';
import { Layers, Target, Info } from 'lucide-react';
import type { ClusteringMode } from '../types';

interface ControlsPanelProps {
  clusteringMode: ClusteringMode;
  onClusteringModeChange: (mode: ClusteringMode) => void;
}

export function ControlsPanel({
  clusteringMode,
  onClusteringModeChange,
}: ControlsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 right-6 glass-panel rounded-xl p-3 space-y-2 z-10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-cyber-blue" />
        <span className="text-sm font-medium">Visualization</span>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => onClusteringModeChange('none')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            clusteringMode === 'none'
              ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'
              : 'hover:bg-white/5 text-white/70'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Default</span>
        </button>

        <button
          onClick={() => onClusteringModeChange('tiers')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            clusteringMode === 'tiers'
              ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'
              : 'hover:bg-white/5 text-white/70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tier Clustering</span>
        </button>
      </div>

      {clusteringMode === 'tiers' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-white/10"
        >
          <div className="flex items-start gap-2 text-xs text-white/60">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyber-green" />
                <span>Tier 1: Direct support</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyber-blue" />
                <span>Tier 2: Supporting sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyber-purple" />
                <span>Tier 3+: Background context</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
