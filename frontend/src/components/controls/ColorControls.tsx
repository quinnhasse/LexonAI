import { motion } from 'framer-motion';
import type { ColorMode } from '../../types';
import { COLOR_PALETTES } from '../../utils/colorPalettes';
import { getButtonStyle, COLORS, SEMANTIC_COLORS } from '../../utils/constants';

interface ColorControlsProps {
  mode: ColorMode;
  onChange: (mode: ColorMode) => void;
}

export function ColorControls({ mode, onChange }: ColorControlsProps) {
  // The Tactical Polygon Shape for Selected State
  const TACTICAL_CLIP_PATH = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

  const colorModes: Array<{
    value: ColorMode;
    label: string;
    description: string;
    previewColors: string[];
  }> = [
    {
      value: 'white',
      label: 'MONOCHROME',
      description: 'Tactical Grayscale',
      previewColors: ['#cccccc', '#999999', '#666666'],
    },
    {
      value: 'byLevel',
      label: 'SEMANTIC LAYERS',
      description: 'Data Type Coding',
      previewColors: [SEMANTIC_COLORS.QUERY, SEMANTIC_COLORS.LOGIC, SEMANTIC_COLORS.EVIDENCE, SEMANTIC_COLORS.CONTEXT],
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {colorModes.map((colorMode) => {
          const isSelected = mode === colorMode.value;
          // Custom button style implementation for granular control
          
          return (
            <button
              key={colorMode.value}
              onClick={() => onChange(colorMode.value)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                textAlign: 'left',
                // Angular Shape
                clipPath: isSelected ? TACTICAL_CLIP_PATH : 'none',
                background: isSelected ? '#ffffff' : 'transparent',
                color: isSelected ? '#000000' : '#9ca3af',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '44px'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              {/* Color preview swatches */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {colorMode.previewColors.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      // Swatch Border Logic: Black border if selected (to pop against white), Transparent/Subtle if not
                      border: isSelected ? '1px solid #000000' : '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: color,
                      borderRadius: '1px' // Sharp/Technical
                    }}
                  />
                ))}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: 800, // Extra Bold
                  color: isSelected ? '#000000' : '#f3f4f6', // Gray-100
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  fontFamily: 'Space Mono, monospace',
                  whiteSpace: 'nowrap'
                }}>
                  {colorMode.label}
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  color: isSelected ? '#4b5563' : '#9ca3af', // Gray-600 vs Gray-400
                  marginTop: '2px',
                  fontWeight: 500, // Medium
                  fontFamily: 'Space Mono, monospace',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {colorMode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
