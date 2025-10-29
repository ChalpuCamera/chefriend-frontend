작업에서의 완료 기준이 뭔지, 그 기준을 충족하기 위해서는 어떤 테스트를 해봐야되는 지 알려줘

# chefriend Frontend Platform - Design System Rules

This document defines the design system rules and coding conventions for integrating Figma designs into the Chalpu Frontend Platform codebase using the Figma MCP (Model Context Protocol) server.

## Project Overview

- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with CSS Variables
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Form Management**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Notifications**: sonner

## Design System Structure

### 1. Token Definitions

Design tokens are defined as CSS custom properties in `src/app/globals.css`:

- **Color System**: Using OKLCH color space for better color management
- **Spacing**: Based on rem units
- **Border Radius**: Variables for consistent rounded corners (`--radius`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)

#### Color Tokens
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive
--border, --input, --ring
--card, --card-foreground
--popover, --popover-foreground
--chart-1 through --chart-5
--sidebar-* variants
```

### 2. Component Library Structure

All UI components are located in `src/components/ui/`:

- Alert Dialog: `alert-dialog.tsx`
- Avatar: `avatar.tsx`
- Badge: `badge.tsx`
- Button: `button.tsx`
- Card: `card.tsx`
- Checkbox: `checkbox.tsx`
- Dialog: `dialog.tsx`
- Form: `form.tsx`
- Input: `input.tsx`
- Label: `label.tsx`
- Navigation Menu: `navigation-menu.tsx`
- Progress: `progress.tsx`
- Radio Group: `radio-group.tsx`
- Scroll Area: `scroll-area.tsx`
- Select: `select.tsx`
- Separator: `separator.tsx`
- Sheet: `sheet.tsx`
- Skeleton: `skeleton.tsx`
- Tabs: `tabs.tsx`
- Textarea: `textarea.tsx`
- Sonner (Toast): `sonner.tsx`

### 3. Component Architecture

#### Variant System
Components use `class-variance-authority` (CVA) for variant management:

```typescript
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes"
      },
      size: {
        default: "size-classes",
        sm: "small-classes",
        lg: "large-classes"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

#### Component Pattern
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  // Component specific props
}

const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn("base-classes", className)}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component }
```

### 4. Styling Approach

#### Tailwind CSS v4
- Using Tailwind CSS v4 with PostCSS
- Custom variants: `@custom-variant dark (&:is(.dark *))`
- Theme configuration inline with CSS variables

#### Utility Classes
- Utility function `cn()` in `src/lib/utils.ts` for conditional class names
- Uses `clsx` and `tailwind-merge` for optimal class merging

#### Dark Mode
- Dark mode support via `.dark` class on parent elements
- All color tokens have light and dark variants

### 5. Icon System

- Icons from `lucide-react` library
- Icon sizing convention: `[&_svg]:size-4` (16px default)
- Icons should be imported individually:
  ```typescript
  import { ChevronRight, Home, Settings } from "lucide-react"
  ```

### 6. Form Handling

Forms use `react-hook-form` with `zod` validation:

```typescript
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  field: z.string().min(1, "Required")
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
})
```

### 7. Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth group routes
│   ├── api/               # API routes
│   ├── customer/          # Customer pages
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # shadcn/ui components
└── lib/
    └── utils.ts           # Utility functions
```

## Figma Integration Guidelines

### When Converting Figma Designs to Code:

1. **Component Mapping**
   - Map Figma components to existing shadcn/ui components
   - Use the variant system for different states/styles
   - Prefer composition over creating new components

2. **Color Mapping**
   - Convert Figma colors to use existing CSS variables
   - Never hardcode color values
   - Use semantic color tokens (e.g., `primary`, `secondary`)

3. **Spacing and Layout**
   - Use Tailwind spacing utilities (p-4, m-2, gap-3)
   - Maintain consistent spacing based on 4px/8px grid

5. **Responsive Design**
   - Mobile-first approach
   - Use Tailwind responsive prefixes: sm:, md:, lg:, xl:, 2xl:

6. **State Management**
   - Interactive states via Tailwind modifiers: hover:, focus:, active:, disabled:
   - Use aria-* attributes for accessibility

### Best Practices

1. **Always use existing components** from `src/components/ui/` when possible
2. **Follow the CVA pattern** for component variants
3. **Use semantic HTML** elements
4. **Ensure accessibility** with proper ARIA labels and keyboard navigation
5. **Keep components composable** and reusable
6. **Use TypeScript** for type safety
7. **Follow the existing file naming convention** (kebab-case for files)
8. **Import order**: React → External libs → Internal imports → Types

### Example Component Creation from Figma

When creating a new component from Figma:

```typescript
// src/components/ui/new-component.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const newComponentVariants = cva(
  "base styles from Figma",
  {
    variants: {
      // Map Figma variants
    }
  }
)

interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Additional props
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(newComponentVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
NewComponent.displayName = "NewComponent"

export { NewComponent }
```

## Assets and Media

- Store images in `public/` directory
- Use Next.js `Image` component for optimization
- Naming convention: kebab-case (e.g., `hero-image.png`)

## Testing and Validation

- Run `npm run lint` to check code style
- Ensure TypeScript compilation with `npm run build`
- Test responsive design at all breakpoints
- Verify dark mode appearance

## MCP Server Rules

### Figma Dev Mode MCP Server Rules

- **Asset Handling**:
  - Figma Dev Mode MCP server provides endpoints for images and SVG assets
  - **IMPORTANT**: When Figma Dev Mode MCP server returns a localhost source for images or SVGs, use that source directly
  - **IMPORTANT**: Do NOT import or add new icon packages. All assets must come from the Figma payload
  - **IMPORTANT**: Do NOT use placeholder examples or generate mock data when localhost sources are provided

### General Figma MCP Guidelines

When using the Figma MCP server tools:
- Framework: `react, nextjs, tailwindcss, shadcn-ui`
- Languages: `typescript, javascript, html, css`
- Always check if a shadcn/ui component exists before creating custom components
- Map Figma auto-layout to Flexbox/Grid utilities
- Convert Figma effects to Tailwind utilities (shadow-xs, shadow-sm, etc.)