import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { ColorEngine } from '../utils/colorPalettes';
import { PANEL_STYLES } from '../utils/constants';
import type { ColorMode, ColorPaletteName } from '../types';

interface ColorLegendProps {
  colorMode: ColorMode;
  palette?: ColorPaletteName;
}

interface LegendEntry {
  label: string;
  color: string;
  description: string;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ colorMode, palette = 'tactical' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorEngine = new ColorEngine(palette);

  const getLegendEntries = (): LegendEntry[] => {
    switch (colorMode) {
      case 'white':
        return []; // Hidden in monochrome mode

      case 'byLevel':
      case 'byTier':
        // By Tier mode - show layer-based colors
        return [
          {
            label: 'Layer 1',
            color: colorEngine.palette.tier1,
            description: 'Conceptual branches radiating from center'
          },
          {
            label: 'Layer 2',
            color: colorEngine.palette.tier2,
            description: 'Primary evidence and direct sources'
          },
          {
            label: 'Layer 3',
            color: colorEngine.palette.tier3,
            description: 'Supporting concepts and context'
          },
          {
            label: 'Layer 0/4+',
            color: colorEngine.palette.tier4,
            description: 'Central question and answer root'
          },
        ];

      case 'byRole':
        // By Type mode - show node type colors
        return [
          {
            label: 'Question',
            color: colorEngine.palette.principle,
            description: 'The original query being answered'
          },
          {
            label: 'Answer Root',
            color: colorEngine.palette.fact,
            description: 'Central hub connecting all answer blocks'
          },
          {
            label: 'Answer Block',
            color: colorEngine.palette.example,
            description: 'Individual concepts in the answer'
          },
          {
            label: 'Direct Source',
            color: colorEngine.palette.fact,
            description: 'Primary evidence cited in the answer'
          },
          {
            label: 'Secondary Source',
            color: colorEngine.palette.analogy,
            description: 'Background context supporting sources'
          },
        ];

      default:
        return [];
    }
  };

  // Don't render in white mode
  if (colorMode === 'white') {
    return null;
  }

  const entries = getLegendEntries();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: PANEL_STYLES.TOP, // 16px
        left: '64px', // 8px gap from return button (which is 40px wide + 16px from left)
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          height: '40px',
          minWidth: '80px',
          padding: '0 16px',
          backgroundColor: PANEL_STYLES.BG,
          border: `1px solid ${PANEL_STYLES.BORDER}`,
          borderRadius: PANEL_STYLES.BORDER_RADIUS,
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          transition: 'all 0.15s ease',
          fontFamily: 'monospace',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1a1a1a';
          e.currentTarget.style.borderColor = '#666666';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = PANEL_STYLES.BG;
          e.currentTarget.style.borderColor = PANEL_STYLES.BORDER;
        }}
      >
        <Key size={14} />
        KEY
      </button>

      {/* Expanded Legend Content */}
      {isExpanded && (
        <div
          style={{
            width: '280px',
            marginTop: '8px',
            backgroundColor: PANEL_STYLES.BG,
            border: `1px solid ${PANEL_STYLES.BORDER}`,
            borderRadius: PANEL_STYLES.BORDER_RADIUS,
            padding: PANEL_STYLES.PADDING,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              {/* Color Swatch - Square like in ColorControls */}
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: entry.color,
                  border: `1px solid ${PANEL_STYLES.BORDER}`,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
              {/* Label and Description */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                  }}
                >
                  {entry.label}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.3px',
                    color: '#666666',
                    fontFamily: 'monospace',
                    lineHeight: '1.4',
                  }}
                >
                  {entry.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ColorLegend;
