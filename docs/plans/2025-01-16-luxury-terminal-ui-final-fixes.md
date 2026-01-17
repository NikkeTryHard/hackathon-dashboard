# Luxury Terminal UI - Final Fixes Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all remaining issues identified in the final code review before merge.

**Architecture:** Minor component fixes and code cleanup. No structural changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4

---

## Important Issues (Must Fix)

### Task 1: Fix Undefined Input Class in Admin Page

**Files:**

- Modify: `app/(authenticated)/admin/page.tsx`

**Step 1: Replace `input` with `input-field` class**

Find line 127 (or search for `className="input flex-1"`) and replace:

```tsx
// Before:
<input ... className="input flex-1" ... />

// After:
<input ... className="input-field flex-1" ... />
```

**Step 2: Verify no other instances**

Run: `grep -r "className=\"input " --include="*.tsx" .`

If any other files use `className="input "`, update them to use `input-field`.

**Step 3: Commit**

```bash
git add app/\(authenticated\)/admin/page.tsx
git commit -m "fix: replace undefined input class with input-field in admin page"
```

---

### Task 2: Implement Online Avatars Section in Sidebar

**Files:**

- Modify: `components/Sidebar.tsx`

**Step 1: Replace the placeholder with actual implementation**

Find the online section (lines 46-48 approximately) and replace:

```tsx
// Before:
<div className="flex -space-x-2" id="online-avatars">
  {/* Populated by client */}
</div>

// After:
<div className="flex -space-x-2">
  {/* Online avatars will be populated when PresenceProvider is connected */}
  <div className="w-7 h-7 rounded-full bg-surface-2 border-2 border-surface-0 flex items-center justify-center text-[10px] font-medium text-text-tertiary">
    ...
  </div>
</div>
```

**Alternative approach - Remove the incomplete section entirely:**

If the online avatars feature is not ready, remove the entire "Online section" div to avoid showing incomplete UI:

```tsx
// Remove lines 44-52 (the entire online section div)
{
  /* Online section */
}
<div className="p-4 border-t border-border-dim">...</div>;
```

**Step 2: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "fix: remove incomplete online avatars placeholder from sidebar"
```

---

## Minor Issues (Nice to Have)

### Task 3: Remove TODO Comments from Admin Page

**Files:**

- Modify: `app/(authenticated)/admin/page.tsx`

**Step 1: Find and remove or convert TODO comments**

Search for TODO comments (around lines 82, 88) and either:

- Remove them if no longer needed
- Convert to proper issue tracking references

```tsx
// Before:
// TODO: Connect to backend API

// After (remove or replace with):
// Note: Backend API integration pending - see issue #XX
```

**Step 2: Commit**

```bash
git add app/\(authenticated\)/admin/page.tsx
git commit -m "chore: clean up TODO comments in admin page"
```

---

### Task 4: Remove Legacy CSS Compatibility Mappings

**Files:**

- Modify: `app/globals.css`

**Step 1: Verify legacy classes are not used**

Run: `grep -r "bg-primary\|bg-elevated\|bg-surface\|border-subtle\|border-default\|accent-dim" --include="*.tsx" .`

If no files use these legacy variable names, remove the legacy mappings section.

**Step 2: Remove legacy mappings from :root (if unused)**

Find and remove lines 42-49 (approximately):

```css
/* Remove this block if unused: */
/* Legacy mappings for compatibility */
--bg-primary: var(--void);
--bg-elevated: var(--surface-0);
--bg-surface: var(--surface-1);
--border-subtle: var(--border-dim);
--border-default: var(--border);
--accent: var(--gold);
--accent-dim: var(--gold-dim);
```

**Step 3: Remove duplicate surface classes (if unused)**

Find and remove the legacy `.surface` and `.surface-raised` classes (lines 117-130 approximately) if they duplicate `.surface-base` and `.surface-elevated`:

```css
/* Remove if duplicates: */
/* Legacy compat */
.surface { ... }
.surface-raised { ... }
```

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "chore: remove unused legacy CSS compatibility mappings"
```

---

### Task 5: Use cn() Utility for Consistent Class Merging

**Files:**

- Modify: `components/ModelCard.tsx`

**Step 1: Update className to use cn() utility**

Find line 19 (the motion.div className) and update:

```tsx
// Before:
className={`surface-base p-4 ${config.bgColor} ${config.borderColor} ${config.hoverBorder} transition-all cursor-default`}

// After:
import { cn } from "@/lib/utils";

className={cn(
  "surface-base p-4 transition-all cursor-default",
  config.bgColor,
  config.borderColor,
  config.hoverBorder
)}
```

**Step 2: Verify cn import exists**

Check that `@/lib/utils` exports a `cn` function. If not, this task can be skipped.

**Step 3: Commit**

```bash
git add components/ModelCard.tsx
git commit -m "refactor: use cn() utility for consistent class merging in ModelCard"
```

---

## Final Verification

### Task 6: Build and Lint Verification

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run lint**

```bash
npm run lint
```

Note: Pre-existing lint error in `lib/auth-context.tsx` is out of scope.

**Step 3: Search for any remaining undefined classes**

```bash
grep -r "bg-dark-bg\|neon-green\|neon-purple\|neon-cyan\|className=\"input " --include="*.tsx" .
```

Expected: No results.

**Step 4: Report results**

---

## Summary

| Task | Type         | Description                                  |
| ---- | ------------ | -------------------------------------------- |
| 1    | Important    | Fix undefined input class in admin page      |
| 2    | Important    | Remove incomplete online avatars placeholder |
| 3    | Minor        | Remove TODO comments from admin page         |
| 4    | Minor        | Remove legacy CSS compatibility mappings     |
| 5    | Minor        | Use cn() utility in ModelCard                |
| 6    | Verification | Build and lint check                         |

Total: 6 tasks, approximately 10-15 minutes of implementation time.
