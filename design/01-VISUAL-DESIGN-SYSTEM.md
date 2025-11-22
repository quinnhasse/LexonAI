# Visual Design System

## Color Palette

### Foundation Colors

```css
/* Base Dark Theme */
--bg-void: #0a0a0f;           /* Deep space background */
--bg-surface: #131318;         /* UI surface layer */
--bg-elevated: #1a1a22;        /* Cards, panels, hover states */
--bg-input: #1e1e28;           /* Input fields */

/* Text Hierarchy */
--text-primary: #e8e8f0;       /* Primary content, 95% opacity */
--text-secondary: #a8a8b8;     /* Secondary content, 70% opacity */
--text-tertiary: #707080;      /* Hints, labels, 50% opacity */
--text-disabled: #48485a;      /* Disabled state, 30% opacity */
```

### Accent Colors (Restrained Neon)

```css
/* Primary Accents */
--accent-cyan: #4dd4d4;        /* Primary actions, active nodes */
--accent-purple: #9d7ced;      /* Secondary actions, Tier 2 nodes */
--accent-green: #4dda64;       /* Success, Tier 1 nodes */
--accent-blue: #4d9eff;        /* Info, supporting nodes */

/* Muted Variants (for backgrounds) */
--accent-cyan-muted: rgba(77, 212, 212, 0.15);
--accent-purple-muted: rgba(157, 124, 237, 0.15);
--accent-green-muted: rgba(77, 218, 100, 0.15);
--accent-blue-muted: rgba(77, 158, 255, 0.15);

/* Glows (for edges, highlights) */
--glow-cyan: rgba(77, 212, 212, 0.4);
--glow-purple: rgba(157, 124, 237, 0.4);
--glow-green: rgba(77, 218, 100, 0.4);
```

### Semantic Colors

```css
/* States */
--state-success: #4dda64;
--state-warning: #ffb84d;
--state-error: #ff6b6b;
--state-info: #4d9eff;

/* Interactive */
--interactive-hover: rgba(232, 232, 240, 0.08);
--interactive-active: rgba(232, 232, 240, 0.12);
--interactive-focus: #4dd4d4;
```

### Clustering Tier Colors

```css
/* Distance-based node grouping */
--cluster-tier1: #4dda64;      /* Direct answer support - Green */
--cluster-tier2: #4dd4d4;      /* Supporting tier 1 - Cyan */
--cluster-tier3: #9d7ced;      /* Background context - Purple */
--cluster-tier4: #4d6b8f;      /* Peripheral - Muted Blue */

/* Cluster backgrounds (semi-transparent) */
--cluster-tier1-bg: rgba(77, 218, 100, 0.08);
--cluster-tier2-bg: rgba(77, 212, 212, 0.08);
--cluster-tier3-bg: rgba(157, 124, 237, 0.08);
--cluster-tier4-bg: rgba(77, 107, 143, 0.08);
```

---

## Typography

### Font Stack

```css
/* Primary Font - UI Text */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Code, Technical */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;

/* Optional - Headings (add sophistication) */
--font-display: 'Satoshi', 'Inter', sans-serif;
```

### Type Scale

```css
/* Display */
--text-display-lg: 48px / 1.1;     /* 700 weight */
--text-display-md: 36px / 1.2;     /* 700 weight */

/* Headings */
--text-h1: 28px / 1.3;             /* 600 weight */
--text-h2: 22px / 1.4;             /* 600 weight */
--text-h3: 18px / 1.4;             /* 600 weight */
--text-h4: 16px / 1.5;             /* 600 weight */

/* Body */
--text-body-lg: 16px / 1.6;        /* 400 weight */
--text-body-md: 14px / 1.6;        /* 400 weight */
--text-body-sm: 13px / 1.5;        /* 400 weight */

/* Utility */
--text-caption: 12px / 1.4;        /* 500 weight */
--text-overline: 11px / 1.3;       /* 600 weight, uppercase */
```

### Font Weights

```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing System

### Base Unit: 4px

```css
--space-1: 4px;    /* 0.25rem */
--space-2: 8px;    /* 0.5rem */
--space-3: 12px;   /* 0.75rem */
--space-4: 16px;   /* 1rem */
--space-5: 20px;   /* 1.25rem */
--space-6: 24px;   /* 1.5rem */
--space-8: 32px;   /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-20: 80px;  /* 5rem */
--space-24: 96px;  /* 6rem */
```

### Layout Grid

```css
/* Sidebar */
--sidebar-width: 260px;
--sidebar-width-collapsed: 60px;

/* Right Panel */
--panel-width: 380px;

/* Input Bar */
--input-height: 64px;
--input-max-width: 840px;

/* Responsive Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## Border & Radius

### Border Widths

```css
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 3px;
```

### Border Colors

```css
--border-subtle: rgba(232, 232, 240, 0.08);
--border-default: rgba(232, 232, 240, 0.12);
--border-strong: rgba(232, 232, 240, 0.20);
--border-accent: rgba(77, 212, 212, 0.40);
```

### Radius Scale

```css
--radius-sm: 6px;    /* Small elements, tags */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards, panels */
--radius-xl: 16px;   /* Large surfaces */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Shadows & Depth

### Shadow Layers

```css
/* Subtle elevation */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4),
             0 1px 2px rgba(0, 0, 0, 0.3);

/* Default cards */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5),
             0 2px 4px rgba(0, 0, 0, 0.4);

/* Elevated panels */
--shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.6),
             0 4px 8px rgba(0, 0, 0, 0.5);

/* Modals, popovers */
--shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.7),
             0 8px 16px rgba(0, 0, 0, 0.6);

/* Accent glows */
--shadow-glow-cyan: 0 0 20px rgba(77, 212, 212, 0.3),
                    0 0 40px rgba(77, 212, 212, 0.15);

--shadow-glow-green: 0 0 20px rgba(77, 218, 100, 0.3),
                     0 0 40px rgba(77, 218, 100, 0.15);
```

### 3D Globe Depth Cues

```css
/* Fog/Atmosphere */
--fog-color: #0a0a0f;
--fog-near: 10;
--fog-far: 100;

/* Ambient Occlusion */
--ao-intensity: 0.6;
--ao-color: #000000;

/* Depth of Field (optional post-processing) */
--dof-focus-distance: 15;
--dof-aperture: 0.025;
```

---

## Effects & Textures

### Background Patterns

```css
/* Subtle Noise Texture */
background-image: url('data:image/svg+xml,...');
/* Or use canvas-based noise at ~5% opacity */
opacity: 0.05;

/* Grid Overlay (very subtle) */
background-image:
  linear-gradient(rgba(232, 232, 240, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(232, 232, 240, 0.03) 1px, transparent 1px);
background-size: 32px 32px;
```

### Glass Morphism (Panels)

```css
background: rgba(26, 26, 34, 0.7);
backdrop-filter: blur(12px) saturate(120%);
border: 1px solid rgba(232, 232, 240, 0.12);
```

### Scanline Effect (Optional)

```css
/* Subtle tech aesthetic for globe background */
animation: scanline 8s linear infinite;

@keyframes scanline {
  0%, 100% { transform: translateY(-100%); }
  50% { transform: translateY(100%); }
}
opacity: 0.03;
```

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Element | Contrast | Ratio |
|---------|----------|-------|
| Primary text on void | #e8e8f0 on #0a0a0f | 14.2:1 ✓ |
| Secondary text on void | #a8a8b8 on #0a0a0f | 8.5:1 ✓ |
| Accent cyan on surface | #4dd4d4 on #131318 | 6.8:1 ✓ |

### Focus States

```css
/* Keyboard navigation */
:focus-visible {
  outline: 2px solid var(--interactive-focus);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* 3D orbit controls focus */
canvas:focus-visible {
  box-shadow: inset 0 0 0 3px rgba(77, 212, 212, 0.5);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable 3D camera animations */
  .globe-camera-animation {
    animation: none;
  }
}
```

---

## Export for Code

### Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#131318',
        elevated: '#1a1a22',
        accent: {
          cyan: '#4dd4d4',
          purple: '#9d7ced',
          green: '#4dda64',
          blue: '#4d9eff',
        },
        cluster: {
          tier1: '#4dda64',
          tier2: '#4dd4d4',
          tier3: '#9d7ced',
          tier4: '#4d6b8f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(77, 212, 212, 0.3)',
        'glow-green': '0 0 20px rgba(77, 218, 100, 0.3)',
      }
    }
  }
}
```

### CSS Custom Properties (Root)

```css
:root {
  color-scheme: dark;
  /* Import all variables from above sections */
}
```

---

**Next**: Layout Specifications →
