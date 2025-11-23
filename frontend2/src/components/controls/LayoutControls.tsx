import { motion } from 'framer-motion';
import { Grid3x3, Circle, LayoutGrid, Globe } from 'lucide-react';
import type { LayoutMode } from '../../types';
import { getButtonStyle, COLORS } from '../../utils/constants';

interface LayoutControlsProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutControls({ mode, onChange }: LayoutControlsProps) {
  const layouts: Array<{ value: LayoutMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'cluster',
      label: 'Cluster',
      icon: <Grid3x3 style={{ width: '16px', height: '16px' }} />,
      description: 'Hierarchical grouped structure',
    },
    {
      value: 'circular',
      label: 'Circular',
      icon: <Circle style={{ width: '16px', height: '16px' }} />,
      description: 'Flat concentric rings',
    },
    {
      value: 'globe',
      label: 'Globe',
      icon: <Globe style={{ width: '16px', height: '16px' }} />,
      description: 'Spherical 3D surface',
    },
    {
      value: 'flat',
      label: 'Baseline',
      icon: <LayoutGrid style={{ width: '16px', height: '16px' }} />,
      description: 'Simple baseline layout',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
        Layout Mode
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {layouts.map((layout) => {
          const isSelected = mode === layout.value;
          const buttonStyle = getButtonStyle(isSelected);

          return (
            <motion.button
              key={layout.value}
              onClick={() => onChange(layout.value)}
              style={{
                ...buttonStyle,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                textAlign: 'left',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ color: isSelected ? COLORS.CYBER_BLUE : 'rgba(255, 255, 255, 0.5)' }}>
                {layout.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{layout.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{layout.description}</div>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="active-layout"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: COLORS.CYBER_BLUE,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
