---
name: TechHub PC
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  container-max: 1280px
---

## Brand & Style
The design system for this premium gaming retail store balances high-performance aesthetics with the clarity of a high-end e-commerce platform. The target audience includes PC enthusiasts, competitive gamers, and creative professionals who value precision and reliability.

The style is **Corporate / Modern** with a focus on technical excellence. It employs a structured, grid-based layout that mimics the precision of hardware engineering. The interface uses high-quality photography and expansive white space to allow product specs and vivid accents to take center stage. The emotional response should be one of confidence, speed, and premium quality.

## Colors
This design system utilizes a high-contrast palette to drive conversion and clarity.
- **Primary (Vivid Blue):** Used for primary actions, progress indicators, and active states. It signals technology and reliability.
- **Secondary (Red-Orange):** Reserved exclusively for promotions, "On Sale" badges, and urgent calls-to-action to ensure maximum visibility.
- **Tertiary (Deep Navy):** Applied to the global header and footer to anchor the page and provide a premium "pro-grade" frame for content.
- **Neutral (Bright Grey):** The `#F5F6F8` background provides a soft, non-distracting canvas that makes the white surface cards and product imagery pop.
- **Text (Charcoal):** Dark grey text ensures high legibility without the harshness of pure black.

## Typography
The typography utilizes **Be Vietnam Pro** to ensure native, beautiful rendering of Vietnamese diacritics while maintaining a contemporary, tech-forward look. 

- **Headlines:** Use Bold (700) weights for product titles and section headers to create clear hierarchy. Tighten letter spacing on larger headlines for a more "designed" editorial feel.
- **Body:** Use Regular (400) for product descriptions and reviews to ensure maximum readability during long-form research.
- **Labels:** Use SemiBold (600) for navigation items and technical specifications (e.g., RAM size, GPU chipset) to make them scannable.

## Layout & Spacing
The design system follows a **Fixed Grid** model for desktop, centered within a 1280px container. This ensures that high-resolution product photography remains sharp and aligned.

- **Grid:** 12-column grid for desktop (24px gutter), 4-column grid for mobile.
- **Spacing Rhythm:** Based on an 8px scale. Use `md` (24px) for padding within cards and between standard elements. Use `lg` (48px) to separate major sections like "Featured Products" from "New Arrivals."
- **Mobile Adaption:** Margins reduce to 16px. Product grids reflow from 4 columns to 2 columns for easy thumb-scrolling on mobile devices.

## Elevation & Depth
Depth is created through **Tonal Layers** rather than heavy shadows to maintain a clean, retail-focused aesthetic.

- **Level 0 (Background):** The neutral `#F5F6F8` surface.
- **Level 1 (Cards):** White surfaces with a very subtle 1px border (`#E2E8F0`) and a soft, highly diffused ambient shadow (8px blur, 4% opacity black).
- **Level 2 (Interactive/Hover):** When a user hovers over a product card, the shadow deepens (16px blur, 8% opacity) and the card lifts slightly to indicate interactivity.
- **Overlays:** Modals and dropdowns use a crisp white surface with a prominent shadow to separate from the background content.

## Shapes
In accordance with the "ROUND_EIGHT" requirement, this design system uses a **Rounded** shape language centered on an 8px (0.5rem) base.

- **Standard Elements:** Buttons, input fields, and product cards use 8px corners.
- **Large Elements:** Banners and large containers use 16px (`rounded-lg`) to soften the overall interface.
- **Small Elements:** Tooltips and tags use 4px (`rounded-sm`).
- **Icons:** Use icons with a matching corner radius to maintain visual consistency across the UI.

## Components
- **Buttons:** Primary buttons are Solid Vivid Blue with white text. Secondary buttons use a Navy outline. Promotion-specific buttons (e.g., "Flash Sale") use the Red-Orange accent.
- **Product Cards:** Must include a white background, 8px border-radius, and clear price hierarchy. Labels for "New" or "Sale" should be pinned to the top-right corner.
- **Input Fields:** Use a 1px border in light grey, switching to Vivid Blue on focus. Labels should be placed above the field in `label-md`.
- **Chips/Badges:** Use light tints of the primary colors (e.g., light blue background with dark blue text) for technical specs like "In Stock" or "RTX 4090".
- **Navigation:** The Deep Navy header should feature white text and clear icons for "Cart", "Account", and "Compare".
- **Specs Table:** Use zebra-striping with the neutral background color for readability in technical data-heavy sections.