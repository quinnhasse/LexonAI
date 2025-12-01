import { useState } from 'react';
import { Grid3x3, Circle, LayoutGrid, Globe, GalleryHorizontal, Settings, Palette } from 'lucide-react';
import type { LayoutMode, ColorMode } from '../../types';
import { ColorControls } from './ColorControls';
import { PANEL_STYLES } from '../../utils/constants';

interface LayoutControlsProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export function LayoutControls({ mode, onChange, colorMode, onColorModeChange }: LayoutControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'colors'>('layout');

  const layouts: Array<{ value: LayoutMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'cluster',
      label: 'Cluster',
      icon: <Grid3x3 style={{ width: '16px', height: '16px' }} />, 
      description: 'Hierarchical Grouping',
    },
    {
      value: 'circular',
      label: 'Circular',
      icon: <Circle style={{ width: '16px', height: '16px' }} />,
      description: 'Concentric Rings',
    },
    {
      value: 'globe',
      label: 'Globe',
      icon: <Globe style={{ width: '16px', height: '16px' }} />,
      description: '3D Spatial View',
    },
    {
      value: 'deck',
      label: 'Knowledge Deck',
      icon: <GalleryHorizontal style={{ width: '16px', height: '16px' }} />,
      description: 'Kanban Logic Flow',
    },
    {
      value: 'flat',
      label: 'Baseline',
      icon: <LayoutGrid style={{ width: '16px', height: '16px' }} />,
      description: 'Standard Grid',
    },
  ];

  // The Tactical Polygon Shape
  const TACTICAL_CLIP_PATH = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

  return (
    <div 
      className="layout-sidebar-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        top: '60px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: PANEL_STYLES.BG, // bg-black/90
        backdropFilter: `blur(${PANEL_STYLES.BLUR})`,
        padding: PANEL_STYLES.PADDING,
        // ANGULAR SHAPE - Replacing Border Radius
        clipPath: TACTICAL_CLIP_PATH, 
        border: `1px solid ${PANEL_STYLES.BORDER}`, // Note: Clip path might cut standard borders
        width: isExpanded ? '260px' : '60px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Tabbed Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'flex-start' : 'center',
        marginBottom: '12px',
        paddingBottom: isExpanded ? '8px' : '0',
        borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
        height: '32px',
        transition: 'all 0.2s'
      }}>
        {!isExpanded ? (
          // Collapsed Icon State
          <div style={{ opacity: 0.8 }}>
             {activeTab === 'layout' ? <Settings size={20} color="#fff" /> : <Palette size={20} color="#fff" />}
          </div>
        ) : (
          // Expanded Tab State
          <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            <button 
              onClick={() => setActiveTab('layout')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'layout' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'layout' ? '#ffffff' : '#6b7280', 
                fontSize: '10px', 
                fontWeight: 700, 
                letterSpacing: '0.1em', 
                paddingBottom: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                fontFamily: 'Space Mono, monospace'
              }}
            >
              LAYOUT
            </button>
            <button 
              onClick={() => setActiveTab('colors')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'colors' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'colors' ? '#ffffff' : '#6b7280',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em', 
                paddingBottom: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                fontFamily: 'Space Mono, monospace'
              }}
            >
              COLORS
            </button>
          </div>
        )}
      </div>

      {/* Sub-header Label "LAYOUT MODE" */}
      {isExpanded && activeTab === 'layout' && (
        <div style={{
          fontSize: '9px',
          fontWeight: 700,
          color: '#4b5563', // text-gray-600
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '4px',
          paddingLeft: '2px',
          fontFamily: 'Space Mono, monospace'
        }}>
          LAYOUT MODE
        </div>
      )}

      {/* Content Area */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        opacity: isExpanded ? 1 : (activeTab === 'layout' ? 1 : 0),
        transition: 'opacity 0.2s'
      }}>
        {activeTab === 'layout' && layouts.map((layout) => {
          const isSelected = mode === layout.value;
          
          return (
            <button
              key={layout.value}
              onClick={() => onChange(layout.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                width: '100%',
                padding: '10px 12px',
                // ANGULAR SHAPE for Selected State
                clipPath: isSelected ? TACTICAL_CLIP_PATH : 'none',
                background: isSelected ? '#ffffff' : 'transparent',
                color: isSelected ? '#000000' : '#9ca3af', 
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '44px',
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
              <div style={{ 
                color: isSelected ? '#000000' : 'currentColor', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px' 
              }}>
                {layout.icon}
              </div>
              
              <div style={{ 
                marginLeft: '16px',
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'all 0.2s ease',
                display: isExpanded ? 'block' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textAlign: 'left'
              }}>
                {/* Technical Typography for Items */}
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: 800, // Extra Bold
                  color: isSelected ? '#000000' : '#f3f4f6', // Gray-100 unselected
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Space Mono, monospace'
                }}>
                  {layout.label}
                </div>
                <div style={{ 
                  color: isSelected ? '#4b5563' : '#9ca3af', // Gray-600 vs Gray-400
                  fontSize: '9px', // Ultra concise text small size
                  marginTop: '2px',
                  fontWeight: 500, // Medium weight
                  fontFamily: 'Space Mono, monospace',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap', // No wrapping
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {layout.description}
                </div>
              </div>
            </button>
          );
        })}

        {activeTab === 'colors' && isExpanded && (
           <div style={{ padding: '4px 0' }}>
             <ColorControls mode={colorMode} onChange={onColorModeChange} />
           </div>
        )}
      </div>
    </div>
  );
}
