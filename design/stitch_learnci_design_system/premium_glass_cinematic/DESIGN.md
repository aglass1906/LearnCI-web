---
name: Premium Glass Cinematic
colors:
  surface: '#10131f'
  surface-dim: '#10131f'
  surface-bright: '#363946'
  surface-container-lowest: '#0b0e19'
  surface-container-low: '#181b27'
  surface-container: '#1c1f2b'
  surface-container-high: '#262936'
  surface-container-highest: '#313441'
  on-surface: '#e0e1f3'
  on-surface-variant: '#d9c3ad'
  inverse-surface: '#e0e1f3'
  inverse-on-surface: '#2d303d'
  outline: '#a18d79'
  outline-variant: '#544433'
  surface-tint: '#ffb865'
  primary: '#ffc788'
  on-primary: '#482a00'
  primary-container: '#ffa000'
  on-primary-container: '#673e00'
  inverse-primary: '#875200'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#c6ceff'
  on-tertiary: '#002487'
  tertiary-container: '#a1b1ff'
  on-tertiary-container: '#0035bd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddba'
  primary-fixed-dim: '#ffb865'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#663d00'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c3ff'
  on-tertiary-fixed: '#001355'
  on-tertiary-fixed-variant: '#0035bd'
  background: '#10131f'
  on-background: '#e0e1f3'
  surface-variant: '#313441'
  surface-elevated: '#23283B'
  glass-fill: rgba(255, 255, 255, 0.04)
  glass-border: rgba(255, 255, 255, 0.1)
  text-muted: rgba(255, 255, 255, 0.7)
  text-dim: rgba(255, 255, 255, 0.4)
  success: '#10B981'
  danger: '#EF4444'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-prose:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  badge-caption:
    fontFamily: Lexend
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style

The design system is built on a **Premium Dark Glassmorphism** aesthetic. It aims to transform language learning into a high-tech, immersive experience that feels more like "hacking" a new skill than traditional study. The mood is futuristic, cinematic, and technical, utilizing depth through translucency rather than flat surfaces.

The visual narrative is defined by:
- **Environmental Depth:** Massive, soft background blurs (Teal, Purple, and Gold) sit deep behind the UI to create a luminous atmosphere.
- **Layered Glass:** Interfaces are constructed from frosted panels with high backdrop-blur values and crisp, micro-borders.
- **Glowing Interactive States:** Critical actions and progress indicators emit soft radial glows, providing tactile visual feedback in a dark environment.

## Colors

The palette uses a high-contrast dark scheme to maintain legibility and visual excitement.

- **Primary (Gold/Fire):** Used for primary CTAs, active navigation states, and "Hard" SRS ratings. It signifies high-priority focus and energy.
- **Secondary (Neon Teal):** Used for progress metrics, completion status, and "Easy" SRS ratings. It represents achievement and fluidity.
- **Tertiary (Royal Purple-Blue):** Primarily decorative; used for background lighting effects and brand-specific gradients to add depth.
- **Neutral (Deep Navy):** The foundational canvas color. Surfaces use a slightly lighter slate blue or semi-transparent glass layers to establish hierarchy.

## Typography

This design system employs a tri-font strategy to separate intent:
- **Outfit:** Modern and geometric. Reserved for structural headers and page titles to project strength.
- **Lexend:** Highly legible and structured. Used in uppercase for micro-copy, navigation labels, and badges to ensure clarity at small scales.
- **Inter:** Neutral and humanist. Optimized for readability in story prose and UI system text.

Story text should always use `body-prose` with a relaxed line-height to reduce cognitive load during long reading sessions.

## Layout & Spacing

The layout follows a **fixed grid** approach on desktop, centered with a maximum width of 1280px. 

- **Grid Model:** 12-column layout with 24px gutters.
- **Spacing Rhythm:** Based on a 4px increment. Page margins are typically 24px (`lg`) on desktop and scale down to 16px (`md`) on mobile.
- **Responsive Behavior:** 
    - **Desktop:** Side-rail navigation (256px width) with fluid content area.
    - **Tablet/Mobile:** Navigation collapses into a bottom-sheet or hamburger drawer. Card grids transition from 3 columns to 1.

## Elevation & Depth

Hierarchy is established through **translucent glass layering** and **ambient glows**:

- **Glass Cards:** Surfaces use a 4% white fill with a 16px backdrop blur. Borders are thin (1px) and semi-transparent to define edges without adding visual weight.
- **Background Blobs:** Large radial gradients (150px+ blur) behind content layers create a sense of environmental immersion.
- **Tactile Shadows:** Instead of standard black shadows, interactive elements use tinted "glow" shadows (e.g., a gold drop shadow for primary buttons) to simulate light emission.
- **Interactive Lift:** Hovered elements should translate -2px on the Y-axis to provide physical feedback.

## Shapes

The shape language is **Rounded** and friendly yet modern.
- **Cards & Primary Sections:** Use `16px` (rounded-2xl) to feel substantial and modern.
- **Buttons & Inputs:** Use `12px` (rounded-xl) for a comfortable, approachable touch target.
- **Avatars & Search Bars:** Use `9999px` (rounded-full) to provide visual contrast against the predominantly rectangular grid.

## Components

### Buttons
- **Gold Glow (Primary):** High-contrast Gold background with Deep Navy text. Must feature a `0 0 15px` gold glow on hover.
- **Teal Ghost (Secondary):** Transparent background with 1px Teal border and Teal text. Use a subtle teal tint (`8%`) for the background on hover.

### Glass Cards
- All content containers must use the glass effect: `backdrop-blur(16px)` and `bg-white/4`. Borders should be `white/10`.

### SRS Flip Cards
- 3D perspective containers. The front shows target language text in `Outfit-ExtraBold`. The back uses color-coded buttons: Again (Red), Hard (Orange), Good (Green), Easy (Teal).

### Progress Indicators
- **Radial Rings:** Use a Neon Teal stroke for completion and a low-opacity `white/5` for the track.
- **Roadmap Bins:** Vertical bars representing hours-based levels, each using a distinct chromatic color from the extended palette.

### Input Fields
- Semi-transparent dark backgrounds with `12px` rounded corners. Focus states should trigger a `1px` primary gold border.

### Word Highlighting (Karaoke)
- Interactive text where active words are wrapped in a `rgba(255, 160, 0, 0.2)` gold highlight with a soft glow.