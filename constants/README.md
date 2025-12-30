# Theme System

All colors and gradients are now centralized in `theme.ts` for easy customization and theme switching.

## Usage

```typescript
import { THEME } from "@/constants/theme";

// Using colors
<View style={{ backgroundColor: THEME.colors.background.primary }}>

// Using gradients
<LinearGradient
  colors={THEME.gradients.primary}
  start={THEME.gradientConfig.start}
  end={THEME.gradientConfig.end}
>

// Using text colors
<Text style={{ color: THEME.colors.text.primary }}>
```

## Available Colors

### Background Colors

- `THEME.colors.background.primary` - Main dark background (#121212)
- `THEME.colors.background.secondary` - Secondary background (#1e1e1e)
- `THEME.colors.background.tertiary` - Tertiary background (#0a0a0a)
- `THEME.colors.background.card` - Card background (#1e1e1e)

### Primary Colors

- `THEME.colors.primary.blue` - Primary blue (#2563eb)
- `THEME.colors.primary.purple` - Primary purple (#9333ea)
- `THEME.colors.primary.darkBlue` - Dark blue (#1d4ed8)

### Accent Colors

- `THEME.colors.accent.gold` - Gold (#fbbf24)
- `THEME.colors.accent.orange` - Orange (#f59e0b)
- `THEME.colors.accent.green` - Green (#16a34a)

### Text Colors

- `THEME.colors.text.primary` - Primary text (#ffffff)
- `THEME.colors.text.secondary` - Secondary text (#d1d5db)
- `THEME.colors.text.tertiary` - Tertiary text (#9ca3af)

## Available Gradients

- `THEME.gradients.primary` - Blue to purple gradient
- `THEME.gradients.primaryButton` - Blue button gradient
- `THEME.gradients.gold` - Gold gradient (for Pro features)
- `THEME.gradients.green` - Green gradient (for success states)
- `THEME.gradients.progress` - Progress bar gradient
- `THEME.gradients.darkBackground` - Dark background gradient

## Gradient Configuration

Use the standard gradient config for consistency:

```typescript
start={THEME.gradientConfig.start}  // { x: 0, y: 0 }
end={THEME.gradientConfig.end}      // { x: 1, y: 1 }
```

## Future Enhancements

To add light theme support:

1. Create a `lightTheme.ts` with light color values
2. Add theme context/provider to switch between themes
3. Update components to use theme context instead of direct imports
