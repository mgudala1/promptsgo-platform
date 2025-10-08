# PromptsGo Design System

## Overview

PromptsGo uses a comprehensive design system built on Tailwind CSS with shadcn/ui components. The system is inspired by Claude's design language, featuring a warm color palette, clean typography, and consistent component patterns.

## Color Palette

### Primary Colors
- **Primary**: `#DA7756` (Orange)
- **Primary Hover**: `#C15F3C`
- **Primary Foreground**: `#FFFFFF`

### Semantic Colors
- **Success**: `#FFD166` (Yellow)
- **Warning**: `#FFD166`
- **Destructive**: `#CF222E` (Red)
- **Accent**: `#B87555` (Brown)

### Neutral Colors
- **Background**: `#F4F3EE` (Light cream)
- **Foreground**: `#3D3929` (Dark brown)
- **Card**: `#FEFEFE` (White)
- **Muted**: `#F4F3EE`
- **Border**: `#3D3929`

### Chart Colors
- Chart 1: `#DA7756`
- Chart 2: `#4CC9F0` (Light blue)
- Chart 3: `#FFD166`
- Chart 4: `#9D4EDD` (Purple)
- Chart 5: `#F28482` (Coral)

## Dark Mode Colors

The system includes a complete dark theme:

- **Background**: `#0D0D0D`
- **Foreground**: `#F0F6FC`
- **Card**: `#161B22`
- **Primary**: `#C15F3C`
- **Muted**: `#21262D`
- **Border**: `#30363D`

## Typography

### Font Families
- **Body/Sans-serif**: `Inter` (Google Fonts)
- **Monospace**: `JetBrains Mono` (Google Fonts)
- **Headings**: `Crimson Text` (Google Fonts)

### Font Sizes and Line Heights

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| h1 | 2.5rem (40px) | 600 | 1.1 | -0.025em |
| h2 | 2rem (32px) | 600 | 1.15 | -0.025em |
| h3 | 1.5rem (24px) | 600 | 1.2 | -0.025em |
| h4 | 1.125rem (18px) | 600 | 1.25 | -0.025em |
| h5 | 1rem (16px) | 600 | 1.25 | -0.025em |
| h6 | 0.875rem (14px) | 600 | 1.25 | -0.025em |
| Body | 1rem (16px) | 400 | 1.6 | 0.0625em |
| Label | 0.875rem (14px) | 500 | 1.43 | - |
| Button | 0.875rem (14px) | 500 | 1.43 | - |
| Input/Textarea | 0.875rem (14px) | 400 | 1.43 | - |
| Small text | 0.875rem (14px) | - | 1.43 | - |
| Tiny text | 0.75rem (12px) | - | 1.33 | - |

## Spacing and Layout

### Container
- **Max Width**: Not fixed, uses `container mx-auto`
- **Padding**: `px-4` (16px horizontal padding)
- **Vertical Spacing**: `py-6` (24px) for content, `py-12 md:py-16` (48px/64px) for sections

### Grid Systems
- **Card Grids**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- **Responsive Breakpoints**:
  - `sm`: 640px+
  - `md`: 768px+
  - `lg`: 1024px+
  - `xl`: 1280px+

### Flexbox Patterns
- **Header**: `flex h-16 items-center justify-between`
- **Centered Content**: `flex items-center justify-center`
- **Space Between**: `flex items-center justify-between`

## Component Patterns

### Cards
- **Base**: `Card` component with `hover:shadow-lg transition-all duration-200`
- **Content**: `CardContent` with `p-4`
- **Hover Effects**: `group-hover:scale-105` for images, `group-hover:text-primary` for text

### Buttons
- **Variants**: `default`, `outline`, `ghost`, `destructive`
- **Sizes**: `sm`, `default`, `lg`
- **States**: Hover, focus, disabled
- **Navigation**: `nav-button` class with `hover:bg-accent/10 hover:text-accent`

### Badges
- **Variants**: `default`, `secondary`, `outline`, `destructive`
- **Sizes**: `sm`, `default`
- **Custom Styling**: Category badges use dynamic colors

### Forms
- **Input**: `Input` component with consistent padding
- **Labels**: `FormLabel` with proper spacing
- **Validation**: Error states with red borders

## UI Components

### Core Components
- **Button**: [`src/components/ui/button.tsx`](src/components/ui/button.tsx)
- **Card**: [`src/components/ui/card.tsx`](src/components/ui/card.tsx)
- **Input**: [`src/components/ui/input.tsx`](src/components/ui/input.tsx)
- **Badge**: [`src/components/ui/badge.tsx`](src/components/ui/badge.tsx)
- **Dialog**: [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx)
- **Dropdown Menu**: [`src/components/ui/dropdown-menu.tsx`](src/components/ui/dropdown-menu.tsx)

### Layout Components
- **Sidebar**: [`src/components/ui/sidebar.tsx`](src/components/ui/sidebar.tsx)
- **Sheet**: [`src/components/ui/sheet.tsx`](src/components/ui/sheet.tsx)
- **Tabs**: [`src/components/ui/tabs.tsx`](src/components/ui/tabs.tsx)
- **Accordion**: [`src/components/ui/accordion.tsx`](src/components/ui/accordion.tsx)

### Data Display
- **Table**: [`src/components/ui/table.tsx`](src/components/ui/table.tsx)
- **Chart**: [`src/components/ui/chart.tsx`](src/components/ui/chart.tsx)
- **Progress**: [`src/components/ui/progress.tsx`](src/components/ui/progress.tsx)

## Layout Principles

### Page Structure
1. **Header**: Sticky navigation with logo, search, and user menu
2. **Hero Section**: Centered content with gradient text and CTAs
3. **Content Sections**: Alternating background colors, consistent spacing
4. **Footer**: Links and branding

### Responsive Design
- **Mobile First**: Base styles for mobile, progressive enhancement
- **Breakpoint Strategy**: `sm`, `md`, `lg`, `xl` for consistent scaling
- **Touch Targets**: Minimum 44px for interactive elements

### Content Hierarchy
- **Visual Weight**: Size, color, and spacing create clear hierarchy
- **Information Architecture**: Logical grouping with cards and sections
- **Progressive Disclosure**: Show essential info first, details on demand

## Implementation Guidelines

### CSS Architecture
- **Tailwind CSS**: Utility-first approach
- **Custom Properties**: CSS variables for theme colors
- **Layer System**: `@layer base`, `@layer components` for organization

### Component Composition
- **shadcn/ui**: Consistent API with variants and sizes
- **Compound Components**: Related components grouped together
- **Forward Refs**: Proper ref forwarding for flexibility

### State Management
- **Visual States**: Hover, focus, active, disabled
- **Loading States**: Skeletons and spinners
- **Error States**: Clear error messaging and recovery

### Accessibility
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Keyboard Navigation**: Focus management and shortcuts
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliance

## Animation and Interactions

### Hover Effects
- **Lift Effect**: `hover-lift` class with transform and shadow
- **Color Transitions**: `transition-colors duration-200`
- **Scale Effects**: `group-hover:scale-105` for images

### Micro-interactions
- **Heart Animation**: Bounce and scale on toggle
- **Button Feedback**: Immediate visual response
- **Loading States**: Smooth transitions

### Performance
- **GPU Acceleration**: Transform and opacity for smooth animations
- **Reduced Motion**: Respect `prefers-reduced-motion`
- **Efficient Selectors**: Minimize layout thrashing

## Dark Mode Implementation

### Theme Switching
- **CSS Variables**: Automatic switching via data attributes
- **System Preference**: Respects user's OS setting
- **Manual Toggle**: ThemeToggle component

### Color Mapping
- **Semantic Consistency**: Same variable names across themes
- **Contrast Maintenance**: Proper ratios in both themes
- **Brand Preservation**: Primary colors adapt appropriately

## Development Workflow

### Adding New Components
1. Check existing patterns in [`src/components/ui/`](src/components/ui/)
2. Use shadcn/ui CLI for consistent structure
3. Follow naming conventions and prop interfaces
4. Test in both light and dark modes

### Modifying Styles
1. Update CSS variables in [`src/styles/globals.css`](src/styles/globals.css)
2. Use Tailwind utilities when possible
3. Test responsive behavior
4. Verify accessibility compliance

### Design Updates
1. Document changes in this system
2. Update component variants if needed
3. Maintain backward compatibility
4. Communicate changes to team

## Tools and Resources

### Design Tools
- **Figma**: Component library and design system
- **Storybook**: Component documentation (future)
- **Chromatic**: Visual regression testing (future)

### Development Tools
- **Tailwind CSS**: Utility framework
- **shadcn/ui**: Component library
- **Lucide Icons**: Icon system
- **Radix UI**: Accessible primitives

### Quality Assurance
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Vitest**: Unit testing

## Version History

- **v1.0**: Initial design system documentation
- Based on Claude-inspired color palette and shadcn/ui components
- Comprehensive coverage of styles, components, and patterns