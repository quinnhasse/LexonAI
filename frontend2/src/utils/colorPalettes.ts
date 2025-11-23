import type { Node as GraphNode, ColorMode } from '../types';

export interface ColorPalette {
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  principle: string;
  fact: string;
  example: string;
  analogy: string;
  default: string;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  cyberpunk: {
    tier1: '#22d3ee', // Cyan - closest to answer
    tier2: '#8b5cf6', // Purple - mid-tier
    tier3: '#10b981', // Green - further out
    tier4: '#ec4899', // Pink - furthest
    principle: '#22d3ee', // Cyan for principles
    fact: '#10b981',      // Green for facts
    example: '#8b5cf6',   // Purple for examples
    analogy: '#ec4899',   // Pink for analogies
    default: '#ffffff',
  },
  sunset: {
    tier1: '#fbbf24', // Amber - answer core
    tier2: '#f97316', // Orange
    tier3: '#ef4444', // Red
    tier4: '#a855f7', // Violet
    principle: '#fbbf24',
    fact: '#f97316',
    example: '#ef4444',
    analogy: '#a855f7',
    default: '#ffffff',
  },
  ocean: {
    tier1: '#06b6d4', // Cyan
    tier2: '#3b82f6', // Blue
    tier3: '#6366f1', // Indigo
    tier4: '#8b5cf6', // Purple
    principle: '#06b6d4',
    fact: '#3b82f6',
    example: '#6366f1',
    analogy: '#8b5cf6',
    default: '#ffffff',
  },
};

export class ColorEngine {
  private palette: ColorPalette;

  constructor(paletteName: string = 'cyberpunk') {
    this.palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.cyberpunk;
  }

  getNodeColor(node: GraphNode, colorMode: ColorMode): string {
    switch (colorMode) {
      case 'white':
        return this.palette.default;

      case 'byLevel':
      case 'byTier':
        return this.getColorByTier(node.metadata.layer || 0);

      case 'byRole':
        // Use node type as role
        return this.getColorByNodeType(node.type);

      default:
        return this.palette.default;
    }
  }

  private getColorByTier(tier: number): string {
    switch (tier) {
      case 1:
        return this.palette.tier1;
      case 2:
        return this.palette.tier2;
      case 3:
        return this.palette.tier3;
      default:
        return this.palette.tier4;
    }
  }

  private getColorByNodeType(type: string): string {
    switch (type) {
      case 'question':
        return this.palette.principle;
      case 'answer_root':
        return this.palette.fact;
      case 'answer_block':
        return this.palette.example;
      case 'direct_source':
        return this.palette.fact;
      case 'secondary_source':
        return this.palette.analogy;
      default:
        return this.palette.default;
    }
  }

  setPalette(paletteName: string) {
    if (COLOR_PALETTES[paletteName]) {
      this.palette = COLOR_PALETTES[paletteName];
    }
  }

  getPalette(): ColorPalette {
    return this.palette;
  }
}

export const colorEngine = new ColorEngine('cyberpunk');
