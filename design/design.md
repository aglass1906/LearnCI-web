# LearnCI Web Design Specification (Google Stitch Ready)

This document serves as the single source of truth for the **LearnCI Web Portal** design system, visual aesthetics, component rules, and page routing layouts. It is optimized to be uploaded or pasted directly into **Google Stitch** (`stitch.withgoogle.com`) to guide AI-native UI generation, ensuring unified design tokens and seamless page relationships.

---

## 1. Design Philosophy & Aesthetic (Premium Dark Glassmorphism)

LearnCI employs a cinematic, layered, **Premium Dark Mode** visual style heavily utilizing **Glassmorphic** principles. Visual depth, soft glows, and crisp contrast ensure that educational content, AI illustrations, and tracking statistics remain highly engaging.

### Core Styling Tokens
*   **Background Canvas:** Deep navy/charcoal (`#161925`) layered over diagonal dark blue-to-black gradients (`#0D1B2A` to `#1B263B`).
*   **Surfaces & Cards:** Semi-transparent glass panels created via `backdrop-blur-md bg-white/5 border border-white/10`. Cards have rounded corners (`border-radius: 12px`).
*   **Active Selection Glow:** Interactive elements utilize a glowing border-accent in Gold/Fire (`#FFA000`) with corresponding drop shadows (`box-shadow: 0 0 15px rgba(255, 160, 0, 0.3)`).
*   **Progress & Badges:** Accent Teal (`#00E5FF`) represents completed metrics, tags, and secondary action indicators.
*   **Primary Gradients:** A deep royal-blue-to-purple gradient (`#3861FB`) is utilized as a background backlight glowing behind panels.

### Typography Hierarchy
*   **Outfit (Google Font):** Display Large, Main Titles, and Section Headers. Structural, bold, modern, and geometric. (e.g., `font-family: 'Outfit', sans-serif`).
*   **Lexend (Google Font):** Micro-badges, uppercase section labels, progress percentages, and interactive action headers. Tight, uppercase, and styled with wide letter-spacing (`letter-spacing: 0.08em`).
*   **Inter (Google Font):** Highly legible reading body, story prose, dialogue bubbles, and user input fields. (e.g., `font-family: 'Inter', sans-serif`).

---

## 2. Core UI Component Library

All screens must construct pages using these standardized, reusable components:

### A. Glassmorphism Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
```

### B. Button Systems
*   **Primary Action Button (Gold Glow):**
    *   *Styles:* Background `#FFA000`, text `#161925` (high contrast), bold Lexend font, rounded `8px`.
    *   *Hover State:* Scale `1.02` with an active gold drop shadow.
*   **Secondary Ghost Button (Teal Border):**
    *   *Styles:* Transparent background, border `1px solid rgba(0, 229, 255, 0.3)`, text `#00E5FF`, Lexend font.
    *   *Hover State:* Background `rgba(0, 229, 255, 0.08)`.
*   **Glass Controls:**
    *   *Styles:* Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#FFFFFF`.

### C. SVG Radial Progress Indicator
*   An SVG ring container of `120x120` coordinates. 
*   Uses a background tracks ring in dark grey (`rgba(255,255,255,0.05)`) and an overlay animated ring in Neon Teal (`#00E5FF`) with a drop shadow filter.
*   Houses the percentage value in Outfit bold and the label "COMPLETE" in Lexend tracking.

### D. Spaced Repetition (SRS) Flip-Card
*   A 3D perspective card container (`perspective: 1000px`) featuring smooth front-to-back rotation.
*   *Front:* Shows target word in 4xl bold Outfit on a glass panel with a thin teal border badge.
*   *Back:* Shows translation in Outfit bold, examples in italicized Inter, and four spaced repetition response buttons: Again (red), Hard (orange), Good (green, glowing), and Easy (teal).

### E. Speech Dialogue Bubbles
*   Left-aligned (Speaker A, Teal accent name badge) and Right-aligned (Speaker B, Gold accent name badge) chat containers.
*   Semi-transparent white backgrounds (`rgba(255, 255, 255, 0.92)`), black text, and 10px rounded corners.

### F. Word Timing Highlighter (Karaoke Text)
*   Standard reading paragraph where each word is wrapped in a span (`class="word-highlight"`).
*   Active words highlight in glowing gold background overlays (`rgba(255, 160, 0, 0.2)`) and gold text colors.
*   Clicking any word opens the Glossary Sidebar Panel.

---

## 3. Web Directory & Layout Architectures

Generate the page directory layouts in Google Stitch using this structural breakdown:

```
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  # Public Landing Page (SEO optimized, hero CTAs, science grid)
│   │   └── how-it-works/             # Krashen's Input Hypothesis educational portal
│   ├── auth/
│   │   ├── login/page.tsx            # Login card with traditional/Google OAuth fields
│   │   ├── signup/page.tsx           # Signup card containing language & level selectors
│   │   └── reset-password/page.tsx   # Lock recovery card and success validation status
│   ├── admin/
│   │   ├── layout.tsx                # Admin sidebar rail navigation
│   │   ├── page.tsx                  # Aggregated stats cards (User levels, mood charts, activities)
│   │   ├── pipeline/
│   │   │   ├── page.tsx              # Tabular grid of in-progress drafts
│   │   │   └── [draftId]/page.tsx    # 7-phase draft editor (JSON editor, Prompt control, terminal)
│   │   ├── stories/
│   │   │   ├── page.tsx              # Live story catalog list (stories table)
│   │   │   └── [storyId]/page.tsx    # Live story editor (Direct text & JSON updates, media paths)
│   │   ├── database/
│   │   │   └── page.tsx              # Learning resources editor (external links, channels)
│   │   └── users/
│   │       └── page.tsx              # User progress logs, mindset logs, and activity rows
│   └── portal/
│       ├── layout.tsx                # Portal navigation header & floating audio cockpit
│       ├── page.tsx                  # Learner Dashboard (weekly streak, progress rings, recommendations)
│       ├── profile/
│       │   └── page.tsx              # Profile settings (Target language, level, TTS voice selections)
│       ├── stories/
│       │   ├── page.tsx              # Filterable story library (dropdowns for language/level)
│       │   └── [id]/
│       │       └── page.tsx          # Multi-presenter reader (Prose scroll, Comic grid, Dialogue bubbles)
│       ├── review/
│       │   └── page.tsx              # SRS Flip-Card center and rating controls
│       ├── podcasts/
│       │   ├── page.tsx              # Podcast show cards grid
│       │   └── [showId]/page.tsx     # Episode browser & scroll-synchronized transcript reader
│       └── watch/
│           ├── page.tsx              # Curated YouTube channel gallery
│           └── [videoId]/page.tsx    # Focus player tracking active minutes to Supabase
```
