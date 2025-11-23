import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Palette } from 'lucide-react';
import type { LayoutMode, ColorMode } from '../../types';
import { LayoutControls } from './LayoutControls';
import { ColorControls } from './ColorControls';
import { PANEL_STYLES, BUTTON_STYLES } from '../../utils/constants';

interface ControlsPanelProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

type TabType = 'layout' | 'color';

export function ControlsPanel({
  layoutMode,
  onLayoutModeChange,
  colorMode,
  onColorModeChange,
}: ControlsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'layout', label: 'Layout', icon: <Globe className="w-4 h-4" /> },
    { id: 'color', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: PANEL_STYLES.TOP,
        right: PANEL_STYLES.RIGHT,
        zIndex: 10,
        minWidth: '280px',
        background: PANEL_STYLES.BG,
        backdropFilter: PANEL_STYLES.BLUR,
        border: `1px solid ${PANEL_STYLES.BORDER}`,
        borderRadius: PANEL_STYLES.BORDER_RADIUS,
        padding: PANEL_STYLES.PADDING,
      }}
    >
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        padding: '4px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              position: 'relative',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
            }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-bg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '6px',
                  background: BUTTON_STYLES.SELECTED_BG,
                  border: `1px solid ${BUTTON_STYLES.SELECTED_BORDER}`,
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '16px', height: '16px', display: 'inline-flex' }}>{tab.icon}</span>
              <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'layout' && (
            <LayoutControls mode={layoutMode} onChange={onLayoutModeChange} />
          )}
          {activeTab === 'color' && (
            <ColorControls mode={colorMode} onChange={onColorModeChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
