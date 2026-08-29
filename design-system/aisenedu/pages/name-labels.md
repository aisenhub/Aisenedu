# Name Labels Page Overrides

> **PROJECT:** Aisenedu 教育工具平台
> **Generated:** 2026-08-29 22:07:50
> **Page Type:** Product Detail

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

> Aisenedu implementation note: preserve the existing light semantic token system and local font stacks. This page proposal is guidance for hierarchy, focus, responsive behavior, and low cognitive load; it does not authorize remote fonts or a second UI library.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- No overrides — use Master colors

### Component Overrides

- Avoid: Placeholder-only inputs
- Avoid: Icon buttons without labels
- Avoid: Placeholder as only label

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Clear focus rings (3-4px), ARIA labels, skip links, responsive design, reduced motion, 44x44px touch targets
- Accessibility: Use label with for attribute or wrap input
- Accessibility: Add aria-label for icon-only buttons
- Forms: Always show label above or beside input
