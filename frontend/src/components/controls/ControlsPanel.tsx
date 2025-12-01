import { motion } from 'framer-motion';
import type { LayoutMode, ColorMode } from '../../types';
import { ColorControls } from './ColorControls';
import { PANEL_STYLES } from '../../utils/constants';

interface ControlsPanelProps {
  layoutMode: LayoutMode; // Kept for prop compatibility but unused
  onLayoutModeChange: (mode: LayoutMode) => void; // Kept for prop compatibility but unused
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export function ControlsPanel({
  colorMode,
  onColorModeChange,
}: ControlsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px', // Moved to top-right to avoid conflict with left sidebar
        zIndex: 10,
        minWidth: '240px',
        background: PANEL_STYLES.BG,
        border: `1px solid ${PANEL_STYLES.BORDER}`,
        borderRadius: PANEL_STYLES.BORDER_RADIUS,
        padding: PANEL_STYLES.PADDING,
      }}
    >
      <div style={{ 
        fontSize: '10px', 
        color: '#666666', 
        marginBottom: '12px', 
        fontWeight: 700, 
        letterSpacing: '1.2px', 
        textTransform: 'uppercase', 
        fontFamily: 'monospace',
        borderBottom: '1px solid #333',
        paddingBottom: '8px'
      }}>
        Display Settings
      </div>
      
      <ColorControls mode={colorMode} onChange={onColorModeChange} />
    </motion.div>
  );
}
