import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { ColorEngine } from '../utils/colorPalettes';
import { PANEL_STYLES, SEMANTIC_COLORS } from '../utils/constants';
import type { ColorMode, ColorPaletteName } from '../types';

interface ColorLegendProps {
  colorMode: ColorMode;
  palette?: ColorPaletteName;
  onHoverType?: (type: string | null) => void;
  onToggleType?: (type: string) => void;
  activeSpotlight?: string | null;
}

interface LegendEntry {
  id: string;
  label: string;
  color: string;
  description: string;
}

// Unified Semantic Naming System
const LEGEND_DEFINITIONS = {
  QUERY: {
    label: 'ANSWER ROOT',
    description: 'Central topic',
  },
  LOGIC: {
    label: 'ANSWER CHUNKS',
    description: 'Key reasoning blocks',
  },
  EVIDENCE: {
    label: 'DIRECT SOURCES',
    description: 'Direct verified sources',
  },
  CONTEXT: {
    label: 'CONCEPTS',
    description: 'Supporting info',
  }
};

const ColorLegend: React.FC<ColorLegendProps> = ({ 
  colorMode, 
  palette = 'tactical',
  onHoverType,
  onToggleType,
  activeSpotlight
}) => {
  // AUTOMATE LEGEND DISPLAY: Open by default
  const [isExpanded, setIsExpanded] = useState(true);
  const colorEngine = new ColorEngine(palette);

  const getLegendEntries = (): LegendEntry[] => {
    const grayscale = {
      query: '#333333',
      logic: '#666666',
      evidence: '#999999',
      context: '#cccccc'
    };

    let colors;

    switch (colorMode) {
      case 'byLevel':
      case 'byTier':
      case 'byRole':
        colors = {
          query: SEMANTIC_COLORS.QUERY,
          logic: SEMANTIC_COLORS.LOGIC,
          evidence: SEMANTIC_COLORS.EVIDENCE,
          context: SEMANTIC_COLORS.CONTEXT
        };
        break;

      case 'white':
      default:
        colors = grayscale;
        break;
    }

    return [
      {
        id: 'QUERY',
        ...LEGEND_DEFINITIONS.QUERY,
        color: colors.query
      },
      {
        id: 'LOGIC',
        ...LEGEND_DEFINITIONS.LOGIC,
        color: colors.logic
      },
      {
        id: 'EVIDENCE',
        ...LEGEND_DEFINITIONS.EVIDENCE,
        color: colors.evidence
      },
      {
        id: 'CONTEXT',
        ...LEGEND_DEFINITIONS.CONTEXT,
        color: colors.context
      }
    ];
  };

  const entries = getLegendEntries();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: PANEL_STYLES.TOP, // 16px
        left: '64px', // 8px gap from return button
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* Toggle Button - STRICT TYPOGRAPHY */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          height: '40px',
          minWidth: '100px',
          padding: '0 16px',
          backgroundColor: PANEL_STYLES.BG,
          backdropFilter: `blur(${PANEL_STYLES.BLUR})`,
          border: `1px solid ${PANEL_STYLES.BORDER}`,
          borderRadius: PANEL_STYLES.BORDER_RADIUS,
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          // Header Typography Rules
          fontSize: '10px', // text-[10px]
          fontWeight: 700, // font-bold
          letterSpacing: '0.1em', // tracking-widest
          textTransform: 'uppercase',
          transition: 'all 0.15s ease',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Space Mono, monospace'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = PANEL_STYLES.BORDER;
          e.currentTarget.style.backgroundColor = PANEL_STYLES.BG;
        }}
      >
        <Key size={14} />
        LEGEND
      </button>

      {/* Expanded Legend Content */}
      {isExpanded && (
        <div
          style={{
            width: '240px',
            marginTop: '8px',
            backgroundColor: PANEL_STYLES.BG,
            backdropFilter: `blur(${PANEL_STYLES.BLUR})`,
            border: `1px solid ${PANEL_STYLES.BORDER}`,
            borderRadius: PANEL_STYLES.BORDER_RADIUS,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          {entries.map((entry) => {
            const isActive = activeSpotlight === entry.id;
            const isDimmed = activeSpotlight && !isActive;

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  opacity: isDimmed ? 0.3 : 1,
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                }}
                onMouseEnter={() => onHoverType?.(entry.id)}
                onMouseLeave={() => onHoverType?.(null)}
                onClick={() => onToggleType?.(entry.id)}
              >
                {/* Color Swatch - Square */}
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: entry.color,
                    flexShrink: 0,
                    marginTop: '2px',
                    borderRadius: '1px', // Sharp square
                    boxShadow: isActive ? `0 0 8px ${entry.color}` : 'none'
                  }}
                />
                {/* Label and Description */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      // Header Typography Rules
                      fontSize: '10px',
                      fontWeight: 800, // Extra Bold for visibility
                      letterSpacing: '0.1em',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                      fontFamily: 'Space Mono, monospace'
                    }}
                  >
                    {entry.label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 500, // Medium
                      color: '#9ca3af', // text-gray-400
                      lineHeight: '1.4',
                      fontFamily: 'Space Mono, monospace'
                    }}
                  >
                    {entry.description}
                  </div>
                </div>
              </div>
            );
          })}
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
