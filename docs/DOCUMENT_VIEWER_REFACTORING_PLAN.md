# Document Viewer Screen - Refactoring Plan

## Current State Analysis

### Files Involved

1. `app/document/[id].tsx` - Route screen (container)
2. `components/documents/DocumentViewer.tsx` - Main viewer component
3. `components/documents/GenerationStatusCard.tsx` - Status card component

### Current Issues

#### 1. **StyleSheet Usage**

- ❌ All components use StyleSheet objects
- ❌ Inconsistent with documents list (which uses Tailwind)
- ❌ Harder to maintain and update
- ❌ More verbose code

#### 2. **UI/UX Issues**

- ❌ Basic header design (no visual depth)
- ❌ Menu dropdown is simple and lacks polish
- ❌ Action buttons are functional but not engaging
- ❌ Generation status cards are basic
- ❌ No smooth animations or transitions
- ❌ Limited visual feedback

#### 3. **Layout Issues**

- ❌ Bottom panel can get crowded with multiple status cards
- ❌ No clear visual hierarchy
- ❌ Action buttons are small and hard to tap
- ❌ Warning banners blend together

#### 4. **Functional Issues**

- ❌ Menu only has delete option (underutilized)
- ❌ No share functionality
- ❌ No document info/metadata display
- ❌ No zoom controls for images
- ❌ No page navigation for PDFs

---

## Refactoring Goals

### Phase 1: Visual Refinements (Priority: HIGH)

**Goal**: Convert to Tailwind CSS and improve visual design

#### A. Convert to Tailwind

- [ ] Replace all StyleSheet objects with Tailwind classes
- [ ] Maintain consistent design system with documents list
- [ ] Use inline styles only where necessary (Image, WebView)

#### B. Enhanced Header

- [ ] Larger, more prominent title
- [ ] Better back button (circular with background)
- [ ] Enhanced menu button with badge indicator
- [ ] Add document type indicator (PDF/Image badge)
- [ ] Subtle shadow for depth

#### C. Improved Menu

- [ ] More options (Share, Info, Rename, Download)
- [ ] Icons for each option
- [ ] Better visual design with dividers
- [ ] Smooth slide-in animation
- [ ] Backdrop overlay

#### D. Better Action Buttons

- [ ] Larger, more prominent buttons
- [ ] Color-coded (blue for questions, amber for notes)
- [ ] Better icons and spacing
- [ ] Loading states with spinners
- [ ] Success states with checkmarks
- [ ] Disabled states more obvious

#### E. Enhanced Status Cards

- [ ] More visual depth with shadows
- [ ] Better progress indicators
- [ ] Animated progress bars
- [ ] Preview cards with better styling
- [ ] Smooth expand/collapse animations

---

### Phase 2: Layout Improvements (Priority: HIGH)

**Goal**: Better information architecture and visual hierarchy

#### A. Reorganize Bottom Panel

```
┌─────────────────────────────────────┐
│ OCR Status (if pending/failed)      │
├─────────────────────────────────────┤
│ Generation Status Cards (if any)    │
│ - Questions Card                    │
│ - Notes Card                        │
├─────────────────────────────────────┤
│ Quick Actions (always visible)      │
│ [Generate Questions] [Generate Notes]│
└─────────────────────────────────────┘
```

#### B. Floating Action Menu

- [ ] Move menu to floating action button (FAB)
- [ ] Expandable menu with multiple options
- [ ] Better positioning (bottom-right)
- [ ] Smooth animations

#### C. Document Info Section

- [ ] Collapsible info panel
- [ ] Show file size, upload date, page count
- [ ] OCR text preview
- [ ] Processing metadata

---

### Phase 3: Enhanced Interactions (Priority: MEDIUM)

**Goal**: Add delightful interactions and better UX

#### A. Image Viewer Enhancements

- [ ] Pinch-to-zoom support
- [ ] Double-tap to zoom
- [ ] Pan and zoom controls
- [ ] Zoom level indicator
- [ ] Reset zoom button

#### B. PDF Viewer Enhancements

- [ ] Page navigation controls
- [ ] Current page indicator
- [ ] Jump to page
- [ ] Zoom controls
- [ ] Download button

#### C. Generation Flow Improvements

- [ ] Inline success animations
- [ ] Confetti or celebration effect
- [ ] Toast notifications instead of alerts
- [ ] Progress notifications
- [ ] Haptic feedback

#### D. Share Functionality

- [ ] Share document file
- [ ] Share generated questions
- [ ] Share generated notes
- [ ] Export options (PDF, text)

---

### Phase 4: Advanced Features (Priority: LOW)

**Goal**: Add power-user features

#### A. Document Annotations

- [ ] Highlight text
- [ ] Add notes/comments
- [ ] Bookmarks
- [ ] Drawing tools (for images)

#### B. Advanced Generation Options

- [ ] Custom difficulty levels
- [ ] Custom question count
- [ ] Custom note length
- [ ] Topic selection
- [ ] Language selection

#### C. Batch Operations

- [ ] Generate for multiple documents
- [ ] Bulk export
- [ ] Bulk delete

---

## Detailed Implementation Plan

### Phase 1A: Convert to Tailwind (Week 1)

#### DocumentViewer.tsx

```tsx
// Before
<View style={styles.header}>
  <TouchableOpacity style={styles.headerButton}>
    <ArrowLeft />
  </TouchableOpacity>
</View>

// After
<View className="flex-row items-center justify-between px-4 pt-16 pb-4 bg-[#1e1e1e] border-b border-gray-700">
  <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center active:scale-90">
    <ArrowLeft size={20} color="#fff" />
  </TouchableOpacity>
</View>
```

#### GenerationStatusCard.tsx

```tsx
// Before
<View style={styles.container}>
  <View style={styles.header}>
    <Icon />
    <Text style={styles.title}>Questions</Text>
  </View>
</View>

// After
<View className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-700 shadow-lg shadow-black/20">
  <View className="flex-row items-center gap-3 mb-3">
    <View className="w-10 h-10 rounded-full bg-blue-600/20 items-center justify-center">
      <Icon size={20} color="#2563eb" />
    </View>
    <Text className="text-lg font-semibold text-white">Questions</Text>
  </View>
</View>
```

---

### Phase 1B: Enhanced Header Design

```tsx
<View className="px-5 pt-16 pb-4 bg-[#1e1e1e] border-b border-gray-700 shadow-lg">
  {/* Back Button */}
  <View className="flex-row items-center justify-between mb-3">
    <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center active:scale-90">
      <ArrowLeft size={20} color="#fff" />
    </TouchableOpacity>

    {/* Document Type Badge */}
    <View className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full">
      <Text className="text-xs text-blue-400 font-medium">
        {isPDF ? "PDF" : "IMAGE"}
      </Text>
    </View>

    {/* Menu Button */}
    <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center active:scale-90">
      <MoreVertical size={20} color="#fff" />
    </TouchableOpacity>
  </View>

  {/* Title */}
  <Text className="text-xl font-bold text-white text-center" numberOfLines={2}>
    {document.title}
  </Text>

  {/* Metadata */}
  <View className="flex-row items-center justify-center gap-2 mt-2">
    <Text className="text-xs text-gray-400">
      {formatFileSize(document.fileSize)}
    </Text>
    <Text className="text-xs text-gray-500">•</Text>
    <Text className="text-xs text-gray-400">
      {formatDate(document.$createdAt)}
    </Text>
  </View>
</View>
```

---

### Phase 1C: Enhanced Menu

```tsx
{
  menuVisible && (
    <>
      {/* Backdrop */}
      <Pressable
        className="absolute inset-0 bg-black/50"
        onPress={() => setMenuVisible(false)}
      />

      {/* Menu */}
      <View className="absolute top-28 right-4 bg-[#1e1e1e] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden min-w-[200px]">
        <TouchableOpacity className="flex-row items-center gap-3 p-4 active:bg-gray-800">
          <Share2 size={20} color="#3b82f6" />
          <Text className="text-white font-medium">Share</Text>
        </TouchableOpacity>

        <View className="h-px bg-gray-700" />

        <TouchableOpacity className="flex-row items-center gap-3 p-4 active:bg-gray-800">
          <Info size={20} color="#3b82f6" />
          <Text className="text-white font-medium">Document Info</Text>
        </TouchableOpacity>

        <View className="h-px bg-gray-700" />

        <TouchableOpacity className="flex-row items-center gap-3 p-4 active:bg-gray-800">
          <Edit3 size={20} color="#3b82f6" />
          <Text className="text-white font-medium">Rename</Text>
        </TouchableOpacity>

        <View className="h-px bg-gray-700" />

        <TouchableOpacity className="flex-row items-center gap-3 p-4 active:bg-gray-800">
          <Download size={20} color="#3b82f6" />
          <Text className="text-white font-medium">Download</Text>
        </TouchableOpacity>

        <View className="h-px bg-gray-700" />

        <TouchableOpacity className="flex-row items-center gap-3 p-4 active:bg-gray-800">
          <Trash2 size={20} color="#ef4444" />
          <Text className="text-red-500 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
```

---

### Phase 1D: Enhanced Action Buttons

```tsx
<View className="flex-row gap-3 p-4">
  {/* Generate Questions Button */}
  <TouchableOpacity
    className={`flex-1 p-4 rounded-2xl border ${
      canGenerate
        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/30"
        : "bg-gray-800 border-gray-700 opacity-50"
    } active:scale-95`}
    disabled={!canGenerate}
  >
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
        {generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <FileQuestion size={24} color="#fff" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">
          Generate Questions
        </Text>
        <Text className="text-white/80 text-xs mt-0.5">
          AI-powered practice
        </Text>
      </View>
    </View>
  </TouchableOpacity>

  {/* Generate Notes Button */}
  <TouchableOpacity
    className={`flex-1 p-4 rounded-2xl border ${
      canGenerate
        ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30"
        : "bg-gray-800 border-gray-700 opacity-50"
    } active:scale-95`}
    disabled={!canGenerate}
  >
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
        {generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <NotebookPen size={24} color="#fff" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">Generate Notes</Text>
        <Text className="text-white/80 text-xs mt-0.5">Study summaries</Text>
      </View>
    </View>
  </TouchableOpacity>
</View>
```

---

### Phase 1E: Enhanced Status Cards

```tsx
<View className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-700 shadow-lg shadow-black/20 mb-3">
  {/* Header */}
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-12 rounded-full bg-blue-600/20 items-center justify-center">
        <FileQuestion size={24} color="#2563eb" />
      </View>
      <View>
        <Text className="text-lg font-bold text-white">Questions</Text>
        <Text className="text-xs text-gray-400">5 questions ready</Text>
      </View>
    </View>
    <CheckCircle2 size={24} color="#10b981" />
  </View>

  {/* Preview Card */}
  <View className="bg-[#121212] rounded-xl p-4 mb-3 border border-gray-700">
    <Text className="text-xs text-gray-400 mb-2">Preview</Text>
    <Text className="text-sm text-white leading-5" numberOfLines={2}>
      Q1: What is the primary function of mitochondria?
    </Text>
  </View>

  {/* View All Button */}
  <TouchableOpacity className="flex-row items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl active:scale-95">
    <Text className="text-white font-semibold">View All Questions</Text>
    <ChevronRight size={18} color="#fff" />
  </TouchableOpacity>
</View>
```

---

## Component Structure (After Refactoring)

```
app/document/[id].tsx (Container)
├── DocumentViewer.tsx (Main Component)
│   ├── DocumentHeader (New Component)
│   │   ├── BackButton
│   │   ├── DocumentBadge
│   │   ├── MenuButton
│   │   └── DocumentMetadata
│   ├── DocumentMenu (Enhanced)
│   │   ├── ShareOption
│   │   ├── InfoOption
│   │   ├── RenameOption
│   │   ├── DownloadOption
│   │   └── DeleteOption
│   ├── DocumentContent
│   │   ├── PDFViewer (WebView)
│   │   └── ImageViewer (Enhanced)
│   └── BottomPanel
│       ├── OCRStatusBanner
│       ├── GenerationStatusCards
│       │   ├── QuestionsCard
│       │   └── NotesCard
│       └── QuickActions
│           ├── GenerateQuestionsButton
│           └── GenerateNotesButton
```

---

## Design System Consistency

### Colors (Match Documents List)

```
Backgrounds: bg-[#121212], bg-[#1e1e1e]
Borders: border-gray-700
Text: text-white, text-gray-300, text-gray-400
Accents: bg-blue-600, bg-amber-500, bg-green-500
```

### Typography

```
Headers: text-xl, text-lg
Body: text-base, text-sm
Meta: text-xs
```

### Spacing

```
Padding: p-4, p-5
Gaps: gap-2, gap-3, gap-4
Margins: mb-3, mb-4
```

### Borders & Shadows

```
Rounded: rounded-xl, rounded-2xl, rounded-full
Shadows: shadow-lg, shadow-2xl
Colored Shadows: shadow-blue-600/30
```

---

## Testing Checklist

### Visual

- [ ] Header renders correctly
- [ ] Menu displays properly
- [ ] Action buttons are prominent
- [ ] Status cards are clear
- [ ] Shadows display correctly
- [ ] Animations are smooth

### Functional

- [ ] Back button works
- [ ] Menu options work
- [ ] Generate buttons work
- [ ] Status cards update
- [ ] PDF viewer works
- [ ] Image viewer works

### Responsive

- [ ] Works on small screens
- [ ] Works on large screens
- [ ] Landscape orientation
- [ ] Portrait orientation

---

## Timeline

### Week 1: Phase 1A-B (Convert to Tailwind + Header)

- Convert all StyleSheet to Tailwind
- Enhance header design
- Test on both platforms

### Week 2: Phase 1C-D (Menu + Action Buttons)

- Implement enhanced menu
- Redesign action buttons
- Add animations

### Week 3: Phase 1E (Status Cards)

- Enhance status cards
- Add preview cards
- Improve progress indicators

### Week 4: Phase 2 (Layout Improvements)

- Reorganize bottom panel
- Add document info section
- Polish and test

---

## Success Metrics

### Code Quality

- [ ] 100% Tailwind CSS (except Image/WebView)
- [ ] Consistent with documents list
- [ ] Reduced code by 30%
- [ ] Better maintainability

### User Experience

- [ ] More engaging visuals
- [ ] Clearer information hierarchy
- [ ] Better feedback
- [ ] Smoother interactions

### Performance

- [ ] No performance regression
- [ ] Smooth animations (60fps)
- [ ] Fast rendering

---

## Conclusion

This refactoring plan will transform the document viewer from a functional but basic interface into a **polished, engaging, and delightful experience** that matches the quality of the documents list screen.

**Priority**: Start with Phase 1 (Visual Refinements) to get immediate visual improvements and consistency with the rest of the app.
