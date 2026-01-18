# @generous/ui - Refined Utility Design System

A comprehensive React component library with 47 accessible components, modern CSS, and full dark mode support.

## Quick Start

```tsx
// Import components
import { Button, Dialog, Toast } from "@generous/ui";

// Import styles in your root layout
import "@generous/ui/tokens";  // Design tokens (colors, spacing, etc.)
import "@generous/ui/styles"; // Reset + base styles
```

## Design Philosophy

**Technical Precision** - High-performance tool aesthetic, NOT a toy.

| Principle | Implementation |
|-----------|---------------|
| Clean lines | Thin crisp borders (1px), no pill shapes for containers |
| Visual hierarchy | Tight tracking for headings, uppercase labels |
| Semantic colors | Auto dark mode via CSS `light-dark()` |
| Accessibility | WCAG AA contrast, focus indicators, reduced motion |

### Accent Color: "Spark"
- Neon Lime: `#ccff00` / `oklch(93% 0.27 120)`
- Used for primary actions and focus states

## Token System (3-Tier)

```
Primitives → Semantic → Component
--color-gray-900 → --text-primary → (component internal)
```

### Using Tokens

```css
/* In your CSS */
.my-component {
  background-color: var(--surface-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

### Key Semantic Tokens

**Surfaces**
- `--surface-base` - Page background
- `--surface-primary` - Cards, elevated content
- `--surface-secondary` - Inset areas, inputs
- `--surface-hover` - Hover state

**Text**
- `--text-primary` - Main content
- `--text-secondary` - Supporting text
- `--text-tertiary` - Muted text

**Actions**
- `--action-primary` - Primary buttons (Jet Black / White)
- `--accent-primary` - Accent highlights (Neon Lime)

## Component Patterns

All components use the **compound component pattern**:

```tsx
// Dialog example
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description text.</Dialog.Description>
      </Dialog.Header>
      {/* Content */}
      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button variant="outline">Cancel</Button>
        </Dialog.Close>
        <Button>Confirm</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

## Component List (47)

### Foundation
- `VisuallyHidden` - Screen reader only content
- `Portal` - Render in document body
- `FocusTrap` - Trap focus for modals
- `Slot` - Render as child element
- `Separator` - Divider line

### Primitives
- `Button` - Primary, secondary, outline, ghost, danger variants
- `Toggle` - Toggleable button
- `ToggleGroup` - Group of toggles
- `Avatar` - User avatar with fallback
- `Badge` - Status indicators
- `Checkbox` - Checkbox input
- `Radio` - Radio button
- `RadioGroup` - Grouped radio buttons
- `Switch` - Toggle switch
- `Progress` - Progress indicator
- `Slider` - Range slider
- `Spinner` - Loading spinner

### Text & Input
- `Input` - Text input
- `Textarea` - Multiline text
- `Label` - Form label
- `Field` - Form field wrapper
- `NumberField` - Numeric input with +/- buttons
- `SearchField` - Search input with clear button

### Overlays
- `Popover` - Floating content
- `Tooltip` - Hover hints
- `Dialog` - Modal dialog
- `AlertDialog` - Confirmation dialog
- `Drawer` - Bottom drawer
- `Sheet` - Side panel

### Selection
- `Select` - Dropdown select
- `Combobox` - Searchable select
- `Menu` - Menu list
- `DropdownMenu` - Dropdown menu
- `ContextMenu` - Right-click menu

### Navigation
- `Tabs` - Tab interface
- `Accordion` - Collapsible sections
- `Collapsible` - Single collapse
- `NavigationMenu` - Nav with submenus
- `Breadcrumb` - Breadcrumb trail
- `Pagination` - Page navigation

### Data Display
- `Table` - Data table
- `ScrollArea` - Custom scrollbar
- `AspectRatio` - Fixed aspect ratio
- `Skeleton` - Loading placeholder
- `Card` - Content card

### Feedback
- `Toast` - Notification toasts
- `Form` - Form layout and validation

## Hooks

```tsx
import { useTheme, useMediaQuery, usePrefersReducedMotion } from "@generous/ui";

// Theme control
const { theme, setTheme, toggleTheme, systemTheme } = useTheme();

// Responsive breakpoints
const isMobile = useMediaQuery("(max-width: 768px)");
const isDesktop = useMediaQuery("md"); // Uses predefined breakpoints

// Accessibility
const prefersReducedMotion = usePrefersReducedMotion();
```

## Dark Mode

Dark mode is automatic via CSS `light-dark()` function:

```css
:root {
  color-scheme: light dark;
  --surface-base: light-dark(var(--color-white), var(--color-gray-900));
}
```

Manual theme control:
```tsx
// Set theme in HTML root
document.documentElement.dataset.theme = "dark"; // or "light"

// Or use the hook
const { setTheme } = useTheme();
setTheme("dark");
```

## Accessibility

- All components use semantic HTML
- Keyboard navigation support
- Focus indicators visible
- ARIA attributes included
- `prefers-reduced-motion` respected
- Color contrast meets WCAG AA

## File Structure

```
packages/ui/src/
├── tokens/
│   ├── primitives.css   # Colors, spacing, typography
│   ├── semantic.css     # Contextual mappings
│   ├── theme.css        # Theme switching
│   └── animations.css   # Keyframes + reduced motion
├── styles/
│   ├── reset.css        # Modern CSS reset
│   └── base.css         # Base element styles
├── components/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── ... (47 components)
├── hooks/
│   ├── useTheme.ts
│   └── useMediaQuery.ts
└── utils/
    └── cn.ts            # Class name utility
```

## CSS Module Naming

Components use CSS Modules with data attributes for variants:

```css
/* Button.module.css */
.root { /* base styles */ }
.root[data-variant="primary"] { /* variant styles */ }
.root[data-size="lg"] { /* size styles */ }
.root[data-loading="true"] { /* state styles */ }
```

## Design Tokens Reference

### Spacing Scale
```
--space-0-5: 2px   --space-6: 24px
--space-1: 4px     --space-8: 32px
--space-1-5: 6px   --space-10: 40px
--space-2: 8px     --space-12: 48px
--space-2-5: 10px  --space-16: 64px
--space-3: 12px    --space-20: 80px
--space-4: 16px    --space-24: 96px
--space-5: 20px
```

### Border Radius
```
--radius-none: 0
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
--radius-xl: 12px
--radius-2xl: 16px
--radius-full: 9999px
```

### Shadows
```
--shadow-elevation-1: 0 1px 2px ...
--shadow-elevation-2: 0 2px 4px ...
--shadow-elevation-3: 0 4px 8px ...
--shadow-elevation-4: 0 8px 16px ...
```

### Animation
```
--duration-75: 75ms
--duration-150: 150ms
--duration-200: 200ms
--duration-300: 300ms

--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## Adding to a New App

1. Install the package (workspace dependency)
2. Import tokens and styles in your root layout
3. Use components with full dark mode support

```tsx
// app/layout.tsx
import "@generous/ui/tokens";
import "@generous/ui/styles";
```

## Contributing

Components follow these patterns:
- Use `forwardRef` for ref forwarding
- Use `dataAttrs()` utility for data attributes
- CSS Modules with `.module.css` extension
- Compound components for complex UI
- Full TypeScript types exported
