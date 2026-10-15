# Design System: Firstlight (Chrome Extension)

## 1. Visual Theme & Atmosphere
A restrained, gallery-airy productivity surface with confident asymmetric
layout and fluid-but-quiet motion. The atmosphere is a calm desk, not a
dashboard: one white canvas, one cobalt accent, dot-grid paper texture.
Dials: VARIANCE 7 / MOTION 5 / DENSITY 3. Light theme only, locked.

## 2. Color Palette & Roles
- **Canvas White** (#FDFDFD) — Primary background, dot-grid host
- **Pure Surface** (#FFFFFF) — Cards, tiles, dock container fill
- **Charcoal Ink** (#18181B) — Primary text, pill navbar/tooltip fill
- **Soft Ink** (#52525B) — Secondary text, descriptions, metadata
- **Faint Ink** (#A1A1AA) — Placeholders, tile labels (never interactive)
- **Whisper Line** (#E4E4E7) — 1px structural borders on surfaces
- **Cobalt Accent** (#2F57D9) — Single accent: focus rings, checked state,
  primary CTA, icon monograms. Saturation kept below 80%.
- Accent wash rgba(47,87,217,0.08) — hover/active tints, clock-tile glow
- Accent ring rgba(47,87,217,0.22) — focus halo

## 3. Typography Rules
- **Display/Body:** Geist (variable 100-900) — tight tracking on display
  (letter-spacing -0.03em), weight-driven hierarchy, max 65ch body measure
- **Mono:** Geist Mono — metadata, dates, counters, form buttons, dot-grid
  cadence. Used sparingly, one mono line per surface max.
- **Banned:** Inter, any serif (software UI), system fallbacks as defaults.

## 4. Component Stylings
- **Pill surfaces:** navbar, tooltips, primary CTA are full-radius (999px).
  Rule: interactive pills = full radius, cards = 16px, inputs = 10px,
  micro = 6px. One radius system, applied consistently.
- **Tiles (bento):** 16px radius, 1px whisper border, diffused ink-tinted
  shadow on hover only. No permanent shadows on grids.
- **Dock:** white pill container (20px radius), flat tiles inside,
  accent-wash hover, translateY(-3px) lift.
- **Inputs:** 10px radius, whisper border, accent ring on focus.
  Label visually hidden but present; no placeholder-as-label.
- **Buttons:** tactile push (-1px translate / scale 0.96 on :active).
  Primary = cobalt fill + white text; secondary = ghost text link.

## 5. Layout Principles
- New tab page: 2fr/1fr asymmetric split (clock+search | Today card),
  centered dock pill at bottom, floating pill navbar on top.
- Landing page: single bento, 4-col grid, explicit areas
  (clock 2x2 hero cell, search 2x1, todos 1x2 tall, stack 1x1,
  dock 2x1 ink band, sync 1x1). DOM order = tab order.
- Max-width 1120px content column. Strict single-column collapse < 768px.
- No overlapping elements; every tile owns its cell.

## 6. Motion & Interaction
- Entrance: one-shot staggered reveal (--i cascade, translateY 12px,
  opacity, var(--ease-out) cubic-bezier(0.16,1,0.3,1)).
- Live elements: clock colon breath, todo strike-through, dock lift.
- Feedback-only motion: hover lift, press push, focus ring. No perpetual
  loops, no parallax, no scroll hijack.
- prefers-reduced-motion: all transitions/animations collapse to instant.
- Animate transform + opacity only. Grain is a fixed pseudo-element.

## 7. Anti-Patterns (Banned)
- No emojis, no Inter, no serif, no pure black, no neon glows,
  no purple/blue-AI gradients, no gradient headline text.
- No 3-equal-card feature rows, no centered hero, no scroll cues,
  no section-number eyebrows, no version footers, no decorative
  status dots, no em/en dashes anywhere in copy.
- No div-faked product screenshots on the landing page: tiles show
  REAL working components (live clock, working search, toggling todos,
  real shortcut links).
- Max 1 eyebrow per 3 sections. Copy stays factual; no "Elevate"-verbs.
