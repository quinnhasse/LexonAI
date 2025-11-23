import { motion } from 'framer-motion';
import type { ColorMode } from '../../types';
import { COLOR_PALETTES } from '../../utils/colorPalettes';
import { getButtonStyle, COLORS } from '../../utils/constants';

interface ColorControlsProps {
  mode: ColorMode;
  onChange: (mode: ColorMode) => void;
}

export function ColorControls({ mode, onChange }: ColorControlsProps) {
  const palette = COLOR_PALETTES.cyberpunk;

  const colorModes: Array<{
    value: ColorMode;
    label: string;
    description: string;
    previewColors: string[];
  }> = [
    {
      value: 'white',
      label: 'White',
      description: 'Clean monochrome view',
      previewColors: ['#ffffff', '#b0b0b0', '#808080'],
    },
    {
      value: 'byLevel',
      label: 'By Level',
      description: 'Color by graph layer depth',
      previewColors: [palette.tier1, palette.tier2, palette.tier3],
    },
    {
      value: 'byRole',
      label: 'By Role',
      description: 'Color by node type',
      previewColors: [palette.principle, palette.fact, palette.example],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
        Color Mode
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {colorModes.map((colorMode) => {
          const isSelected = mode === colorMode.value;
          const buttonStyle = getButtonStyle(isSelected);

          return (
            <motion.button
              key={colorMode.value}
              onClick={() => onChange(colorMode.value)}
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
              {/* Color preview swatches */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {colorMode.previewColors.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{colorMode.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{colorMode.description}</div>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="active-color"
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
