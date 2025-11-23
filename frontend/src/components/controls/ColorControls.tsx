import { motion } from 'framer-motion';
import type { ColorMode } from '../../types';
import { COLOR_PALETTES } from '../../utils/colorPalettes';
import { getButtonStyle, COLORS } from '../../utils/constants';

interface ColorControlsProps {
  mode: ColorMode;
  onChange: (mode: ColorMode) => void;
}

export function ColorControls({ mode, onChange }: ColorControlsProps) {
  const palette = COLOR_PALETTES.tactical;

  const colorModes: Array<{
    value: ColorMode;
    label: string;
    description: string;
    previewColors: string[];
  }> = [
    {
      value: 'white',
      label: 'Monochrome',
      description: 'Grayscale tactical view',
      previewColors: ['#cccccc', '#999999', '#666666'],
    },
    {
      value: 'byLevel',
      label: 'By Tier',
      description: 'Tactical layer depth coding',
      previewColors: [palette.tier1, palette.tier2, palette.tier3],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '10px', color: '#666666', marginBottom: '6px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
        Color Mode
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {colorModes.map((colorMode) => {
          const isSelected = mode === colorMode.value;
          const buttonStyle = getButtonStyle(isSelected);

          return (
            <button
              key={colorMode.value}
              onClick={() => onChange(colorMode.value)}
              style={{
                ...buttonStyle,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                textAlign: 'left',
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
                      border: `1px solid ${isSelected ? '#000000' : '#333333'}`,
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{colorMode.label}</div>
                <div style={{ fontSize: '10px', color: isSelected ? '#000000' : '#666666', marginTop: '2px' }}>{colorMode.description}</div>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    background: '#000000',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
