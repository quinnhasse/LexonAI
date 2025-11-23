/**
 * Shared style constants for the Transparens AI visualization
 * Eliminates magic values and ensures visual consistency
 */

export const COLORS = {
  // Cyberpunk palette (matches colorPalettes.ts)
  CYBER_BLUE: '#22d3ee',
  CYBER_PURPLE: '#8b5cf6',
  CYBER_GREEN: '#10b981',
  CYBER_PINK: '#ec4899',

  // Base colors
  WHITE: '#ffffff',
  BLACK: '#000000',
};

export const BUTTON_STYLES = {
  // Selected state (active)
  SELECTED_BG: 'rgba(34, 211, 238, 0.2)',
  SELECTED_BORDER: 'rgba(34, 211, 238, 0.5)',
  SELECTED_TEXT: '#22d3ee',

  // Unselected state (inactive)
  UNSELECTED_BG: 'rgba(255, 255, 255, 0.05)',
  UNSELECTED_BORDER: 'rgba(255, 255, 255, 0.1)',
  UNSELECTED_TEXT: 'rgba(255, 255, 255, 0.7)',

  // Hover state
  HOVER_BG: 'rgba(255, 255, 255, 0.1)',
};

export const PANEL_STYLES = {
  // Controls panel background
  BG: 'rgba(0, 0, 0, 0.8)',
  BORDER: 'rgba(255, 255, 255, 0.1)',
  BLUR: 'blur(10px)',

  // Positioning
  TOP: '24px',
  RIGHT: '24px',
  BORDER_RADIUS: '12px',
  PADDING: '16px',
};

/**
 * Helper function to create button styles based on selection state
 */
export const getButtonStyle = (isSelected: boolean) => ({
  background: isSelected ? BUTTON_STYLES.SELECTED_BG : BUTTON_STYLES.UNSELECTED_BG,
  border: `1px solid ${isSelected ? BUTTON_STYLES.SELECTED_BORDER : BUTTON_STYLES.UNSELECTED_BORDER}`,
  color: isSelected ? BUTTON_STYLES.SELECTED_TEXT : BUTTON_STYLES.UNSELECTED_TEXT,
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});
