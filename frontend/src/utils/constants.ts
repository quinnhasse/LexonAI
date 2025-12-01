/**
 * Shared style constants for the Transparens AI visualization
 * Military-grade aesthetic: Black and white, minimal borders, tactical UI
 */

export const COLORS = {
  // Military monochrome palette
  PRIMARY: '#ffffff',
  SECONDARY: '#cccccc',
  TERTIARY: '#666666',

  // Base colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  BACKGROUND: '#000000',
  SURFACE: '#0a0a0a',
};

// Strict Semantic Palette
export const SEMANTIC_COLORS = {
  QUERY: '#EF4444',    // Red-500 (Answer/Root)
  LOGIC: '#EAB308',    // Yellow-500 (Answer Chunks - Gold/Mustard)
  EVIDENCE: '#14B8A6', // Teal-500 (Direct Sources - Cyan/Teal)
  CONTEXT: '#22C55E',  // Green-500 (Concepts)
};

export const BUTTON_STYLES = {
  // Selected state (active) - military inverted style
  SELECTED_BG: '#ffffff',
  SELECTED_BORDER: '#ffffff',
  SELECTED_TEXT: '#000000',

  // Unselected state (inactive)
  UNSELECTED_BG: 'transparent',
  UNSELECTED_BORDER: '#333333',
  UNSELECTED_TEXT: '#ffffff',

  // Hover state
  HOVER_BG: '#1a1a1a',
  HOVER_BORDER: '#666666',
};

export const PANEL_STYLES = {
  // Controls panel background - minimal, tactical
  BG: 'rgba(10, 10, 10, 0.9)', // bg-black/90
  BORDER: 'rgba(255, 255, 255, 0.1)', // border-white/10
  BLUR: '12px', // backdrop-blur-md

  // Positioning
  TOP: '16px',
  LEFT: '16px',
  BORDER_RADIUS: '8px', // rounded-lg
  PADDING: '12px',
};

/**
 * Helper function to create button styles based on selection state
 */
export const getButtonStyle = (isSelected: boolean) => ({
  background: isSelected ? BUTTON_STYLES.SELECTED_BG : BUTTON_STYLES.UNSELECTED_BG,
  border: `1px solid ${isSelected ? BUTTON_STYLES.SELECTED_BORDER : BUTTON_STYLES.UNSELECTED_BORDER}`,
  color: isSelected ? BUTTON_STYLES.SELECTED_TEXT : BUTTON_STYLES.UNSELECTED_TEXT,
  padding: '8px 12px',
  borderRadius: '4px', // Slightly rounded
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});
