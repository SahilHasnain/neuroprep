# Dark Theme Implementation Plan

**Date**: December 23, 2025  
**Objective**: Convert the entire Neuroprep frontend to a dark theme with centralized, reusable color system to reduce cognitive load for students.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color Palette](#color-palette)
4. [Implementation Phases](#implementation-phases)
5. [Files to Modify](#files-to-modify)
6. [Migration Strategy](#migration-strategy)
7. [Checklist](#checklist)

---

## 📌 Overview

### Problem

- **30+ hardcoded colors** scattered across screens, components, and utilities
- **Inconsistent theming** with light backgrounds (bg-gray-50, bg-white)
- **Poor student experience** with high-contrast light mode causing eye strain
- **Maintenance burden** - color changes require updating multiple files

### Solution

- Create centralized `theme/colors.ts` file with complete dark theme palette
- Update `tailwind.config.js` to use custom theme colors
- Replace all hardcoded colors with theme references
- Reduce cognitive load with soft, muted dark colors optimized for studying

---

## 🎨 Design Principles

### Dark Theme for Students

1. **Eye-Friendly**: Soft dark grays instead of pure black (#0f0f0f, not #000000)
2. **High Contrast**: White/light text on dark backgrounds for readability
3. **Color-Coded Features**: Blue (doubts), Green (questions), Purple (notes)
4. **Minimal Distraction**: Muted accent colors to keep focus on content
5. **Accessible**: WCAG AA compliant contrast ratios

### Cognitive Load Reduction

- **Consistent Design**: Same colors for same feature type across app
- **Clear Hierarchy**: Text hierarchy (primary, secondary, tertiary)
- **Status Clarity**: Obvious success/error/warning states
- **Soft Transitions**: Muted colors reduce visual fatigue

---

## 🎭 Color Palette

### Core Background & Surface Colors

```typescript
// Primary backgrounds
colors.background = "#0f0f0f"; // Main app background
colors.surface = "#1a1a1a"; // Cards, panels
colors.surfaceElevated = "#252525"; // Elevated containers, dialogs
colors.surfaceBorder = "#333333"; // Subtle borders

// Text hierarchy
colors.textPrimary = "#f5f5f5"; // Main text (H1, body)
colors.textSecondary = "#a3a3a3"; // Supporting text
colors.textTertiary = "#737373"; // Muted, hint text
colors.textDisabled = "#4b5563"; // Disabled state text

// Interactive text
colors.textInverse = "#0f0f0f"; // Text on light backgrounds
colors.textInverseSecondary = "#525252"; // Secondary text on light backgrounds
```

### Feature-Specific Colors

```typescript
// Feature colors (muted for dark mode)
colors.primary = "#60a5fa"; // Blue - Ask Doubt feature
colors.primaryLight = "#3b82f6"; // Slightly lighter blue
colors.primaryDark = "#1d4ed8"; // Darker blue for hover/active

colors.success = "#4ade80"; // Green - Questions feature
colors.successLight = "#22c55e"; // Slightly lighter green
colors.successDark = "#16a34a"; // Darker green for hover/active

colors.accent = "#c084fc"; // Purple - Notes feature
colors.accentLight = "#a855f7"; // Slightly lighter purple
colors.accentDark = "#7c3aed"; // Darker purple for hover/active

colors.warning = "#fbbf24"; // Amber - Pro/important alerts
colors.warningLight = "#fcd34d"; // Lighter amber
colors.warningDark = "#d97706"; // Darker amber

colors.error = "#f87171"; // Red - Errors
colors.errorLight = "#fca5a5"; // Lighter red
colors.errorDark = "#dc2626"; // Darker red

colors.info = "#38bdf8"; // Cyan - Info messages
colors.infoLight = "#06b6d4"; // Lighter cyan
colors.infoDark = "#0891b2"; // Darker cyan
```

### Status & Utility Colors

```typescript
colors.disabled = "#404854"; // Disabled UI elements
colors.placeholder = "#6b7280"; // Placeholder text
colors.border = "#333333"; // Default borders
colors.borderLight = "#4b5563"; // Subtle borders
colors.borderDark = "#1f2937"; // Prominent borders

colors.overlay = "rgba(0, 0, 0, 0.8)"; // Modal overlays
colors.overlayLight = "rgba(0, 0, 0, 0.5)"; // Subtle overlays

colors.shadow = "rgba(0, 0, 0, 0.3)"; // Deep shadows
colors.shadowLight = "rgba(0, 0, 0, 0.1)"; // Subtle shadows
```

### Special Component Colors

```typescript
// Question states
colors.questionCorrect = "#065f46"; // Green-900 for correct answers
colors.questionWrong = "#7f1d1d"; // Red-900 for wrong answers
colors.questionSelected = "#1e40af"; // Blue-900 for selected options

// Chat/Message colors
colors.chatUser = "#3b82f6"; // User message background (blue)
colors.chatBot = "#1a1a1a"; // AI message background (dark)
colors.chatBotBorder = "#333333"; // AI message border

// Code/Monospace
colors.codeBackground = "#1f2937"; // Code block background
colors.codeText = "#f87171"; // Code text (red)

// Blockquote
colors.blockquoteBg = "#1e3a8a"; // Blue-900 for quote background
colors.blockquoteBorder = "#3b82f6"; // Blue for quote left border
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation Setup ⚡

**Goal**: Create the color system foundation  
**Effort**: ~30 mins

**Tasks**:

1. Create `theme/colors.ts` with complete palette
2. Update `tailwind.config.js` to use custom theme colors
3. Test that Tailwind compiles without errors

**Deliverable**: Reusable color system ready for implementation

---

### Phase 2: Core App Screens 🖥️

**Goal**: Update main navigation screens  
**Effort**: ~45 mins

**Files to Update** (7 total):

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx` (Home)
- `app/(tabs)/ask-doubt.tsx`
- `app/(tabs)/notes.tsx`
- `app/(tabs)/generate-questions.tsx`
- `app/(tabs)/subscription.tsx`

**Changes**:

- Replace `bg-gray-50` → dark background colors
- Replace `bg-white` → dark surface colors
- Replace `text-gray-900` → light text colors
- Replace hardcoded hex colors with theme references

**Deliverable**: All main screens use dark theme

---

### Phase 3: UI Components 🧩

**Goal**: Update 25 reusable UI components  
**Effort**: ~90 mins

**Files to Update** (25 total):

**Input Components**:

- `Button.tsx` - All variants (primary, secondary, outline)
- `Input.tsx` - Text input styling
- `TextArea.tsx` - Textarea styling
- `SearchBar.tsx` - Search input with icon
- `InputTopic.tsx` - Topic input field
- `Dropdown.tsx` - Dropdown/select component

**Card Components**:

- `QuestionCard.tsx` - Question display with options
- `NoteCard.tsx` - Note card display
- `PlanCard.tsx` - Subscription plan cards
- `StatsCard.tsx` - Statistics display
- `QuickActionButton.tsx` - Action buttons on home

**Utility Components**:

- `UsageProgressBar.tsx` - Progress bar styling
- `UsageBadge.tsx` - Usage badge display
- `ProBanner.tsx` - Pro plan banner
- `FeatureList.tsx` - Feature list display
- `ErrorBanner.tsx` - Error message banner
- `LimitReachedModal.tsx` - Limit reached dialog

**Advanced Components**:

- `QuestionSetCard.tsx` - Question set cards
- `QuestionSetList.tsx` - List of question sets
- `QuestionDisplay.tsx` - Full question display
- `GenerateQuestionsModal.tsx` - Generate dialog
- `UpgradeModal.tsx` - Upgrade modal
- `AuthModal.tsx` - Authentication modal

**Changes**:

- Replace all TailwindCSS color classes
- Remove hex color codes from inline styles
- Use theme references throughout

**Deliverable**: All UI components themed consistently

---

### Phase 4: Shared & Modal Components 💬

**Goal**: Update shared utilities and modal styling  
**Effort**: ~30 mins

**Files to Update** (4 total):

- `components/shared/ChatBubble.tsx`
  - User messages (blue background → theme.primary)
  - AI messages (gray background → theme.surface)
  - Borders and styling
  - Timestamp text color

- `components/shared/MathMarkdown.tsx`
  - Markdown styling (bold, italic, code, blockquote)
  - Text colors for all markdown elements
  - Code block background and text color
  - Blockquote styling

- `components/modals/UpgradeModal.tsx`
- `components/questions/GenerateQuestionsModal.tsx`

**Changes**:

- Update all style objects with theme colors
- Replace hard coded hex values
- Ensure markdown readability in dark mode

**Deliverable**: Chat and markdown rendering themed correctly

---

### Phase 5: Utilities & Final Touches ✨

**Goal**: Update utilities and verify consistency  
**Effort**: ~15 mins

**Files to Update** (1 file):

- `utils/razorpay.ts` - Razorpay UI color configuration

**Final Checks**:

- Search codebase for remaining `#[0-9A-Fa-f]{6}` patterns
- Verify all Tailwind color classes match theme
- Test on actual devices (iOS/Android)
- Verify contrast ratios (WCAG AA minimum)

**Deliverable**: Complete dark theme implementation

---

## 📁 Files to Modify

### New Files

```
theme/colors.ts                          (NEW)
```

### Configuration

```
tailwind.config.js                       (MODIFY)
```

### App Screens (7 files)

```
app/_layout.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx
app/(tabs)/ask-doubt.tsx
app/(tabs)/notes.tsx
app/(tabs)/generate-questions.tsx
app/(tabs)/subscription.tsx
```

### UI Components (25 files)

```
components/ui/Button.tsx
components/ui/Input.tsx
components/ui/TextArea.tsx
components/ui/SearchBar.tsx
components/ui/InputTopic.tsx
components/ui/Dropdown.tsx
components/ui/QuestionCard.tsx
components/ui/NoteCard.tsx
components/ui/PlanCard.tsx
components/ui/StatsCard.tsx
components/ui/QuickActionButton.tsx
components/ui/UsageProgressBar.tsx
components/ui/UsageBadge.tsx
components/ui/ProBanner.tsx
components/ui/FeatureList.tsx
components/ui/ErrorBanner.tsx
components/ui/LimitReachedModal.tsx
components/questions/QuestionSetCard.tsx
components/questions/QuestionSetList.tsx
components/questions/QuestionDisplay.tsx
components/questions/GenerateQuestionsModal.tsx
components/modals/UpgradeModal.tsx
components/ui/AuthModal.tsx
```

### Shared Components (2 files)

```
components/shared/ChatBubble.tsx
components/shared/MathMarkdown.tsx
```

### Utilities (1 file)

```
utils/razorpay.ts
```

**Total**: 40 files to update across 5 phases

---

## 🔄 Migration Strategy

### Step-by-Step Process

1. **Create Color System**
   - Write `theme/colors.ts` with complete palette
   - Export as named constants
   - Add JSDoc comments for clarity

2. **Update Tailwind Config**
   - Add `colors` to `tailwind.config.js` theme
   - Extend default colors with theme colors
   - Verify no Tailwind conflicts

3. **Phase by Phase Update**
   - Update one phase completely before moving to next
   - Test after each phase on actual device
   - Commit to git after each phase

4. **Verification**
   - Search for remaining hardcoded colors
   - Test all interactive states (hover, active, disabled)
   - Verify text contrast ratios
   - Check modal/dialog styling

### Import Pattern

All files will import colors like:

```typescript
import { colors } from '@/theme/colors';

// Usage in components
<View className={`bg-[${colors.surface}]`}>
// Or with Tailwind (recommended)
<View className="bg-surface">
```

---

## ✅ Checklist

### Phase 1: Foundation

- [ ] Create `theme/colors.ts` file
- [ ] Update `tailwind.config.js`
- [ ] Test Tailwind compilation
- [ ] Verify colors export correctly

### Phase 2: App Screens

- [ ] Update `app/_layout.tsx`
- [ ] Update `app/(tabs)/_layout.tsx`
- [ ] Update `app/(tabs)/index.tsx`
- [ ] Update `app/(tabs)/ask-doubt.tsx`
- [ ] Update `app/(tabs)/notes.tsx`
- [ ] Update `app/(tabs)/generate-questions.tsx`
- [ ] Update `app/(tabs)/subscription.tsx`
- [ ] Test on device

### Phase 3: UI Components

- [ ] Update all 25 UI component files
- [ ] Remove all hardcoded hex colors
- [ ] Test component variants
- [ ] Verify interactive states

### Phase 4: Shared Components

- [ ] Update `ChatBubble.tsx`
- [ ] Update `MathMarkdown.tsx`
- [ ] Update modal components
- [ ] Test markdown rendering

### Phase 5: Final Touches

- [ ] Update `razorpay.ts`
- [ ] Search for remaining colors
- [ ] Verify contrast ratios
- [ ] Full app testing

### Post-Implementation

- [ ] Test on multiple devices
- [ ] Verify all screens
- [ ] Check accessibility (contrast, readability)
- [ ] Performance check
- [ ] Git commit and cleanup

---

## 🎯 Success Criteria

✅ **100% hardcoded colors removed**  
✅ **Dark theme applied to entire app**  
✅ **All text meets WCAG AA contrast standards**  
✅ **Consistent colors across all screens**  
✅ **Feature-specific color coding maintained**  
✅ **No visual regressions**  
✅ **Improved user experience and reduced cognitive load**

---

## 📝 Notes

- Keep theme colors in a single file for easy maintenance
- Use descriptive color names (not `color1`, `color2`)
- Document why certain colors are chosen for cognitive load reduction
- Consider accessibility at every step
- Test on actual devices, not just simulator
- The dark theme should reduce eye strain for long study sessions

---

**Status**: Ready for Phase 1 Implementation  
**Last Updated**: December 23, 2025
