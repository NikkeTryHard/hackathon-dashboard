# Luxury Terminal UI - Code Review Fixes Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all issues identified in the code review for the Luxury Terminal UI redesign.

**Architecture:** CSS variable additions, Tailwind config updates, and minor component fixes. No structural changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4

---

## Important Issues (Must Fix)

### Task 1: Add Missing Warning Color

**Files:**

- Modify: `app/globals.css` (CSS variables section)
- Modify: `tailwind.config.ts` (colors section)

**Step 1: Add warning CSS variables to globals.css**

In the `:root` block, after the `--info-dim` line, add:

```css
--warning: #f59e0b;
--warning-dim: rgba(245, 158, 11, 0.15);
```

**Step 2: Add warning color to Tailwind config**

In `tailwind.config.ts`, in the colors object after `info: "#6b8afd"`, add:

```typescript
warning: "#f59e0b",
```

**Step 3: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "fix: add missing warning color to design system"
```

---

### Task 2: Fix Undefined bg-dark-bg Class in Layout

**Files:**

- Modify: `app/layout.tsx`

**Step 1: Replace bg-dark-bg with bg-void**

Find the body className and replace `bg-dark-bg` with `bg-void`:

```tsx
<body className={`${jetbrainsMono.variable} font-mono antialiased bg-void`}>
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "fix: replace undefined bg-dark-bg with bg-void"
```

---

### Task 3: Remove Orphaned Neon CSS Classes

**Files:**

- Modify: `app/globals.css`

**Step 1: Remove or replace the orphaned neon classes**

Delete the entire block (lines 69-88 approximately):

```css
.neon-green {
  color: var(--neon-green);
  text-shadow:
    0 0 10px var(--neon-green),
    0 0 20px var(--neon-green);
}

.neon-purple {
  color: var(--neon-purple);
  text-shadow:
    0 0 10px var(--neon-purple),
    0 0 20px var(--neon-purple);
}

.neon-cyan {
  color: var(--neon-cyan);
  text-shadow:
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan);
}
```

**Step 2: Verify no components use these classes**

Run: `grep -r "neon-green\|neon-purple\|neon-cyan" --include="*.tsx" --include="*.ts" .`

If any files still use these classes, they need to be updated to use the new color system (e.g., `text-gold`, `text-info`, `text-success`).

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: remove orphaned neon CSS classes"
```

---

### Task 4: Fix Tailwind Glow Keyframes Color

**Files:**

- Modify: `tailwind.config.ts`

**Step 1: Update the glow keyframes to use gold color**

Find the keyframes section and replace the glow animation:

```typescript
keyframes: {
  glow: {
    "0%": { boxShadow: "0 0 5px rgba(212, 168, 83, 0.2)" },
    "100%": { boxShadow: "0 0 20px rgba(212, 168, 83, 0.4)" },
  },
},
```

**Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "fix: update Tailwind glow keyframes to use gold color"
```

---

## Minor Issues (Nice to Have)

### Task 5: Fix Animation Delay Multiplier in SetupStep

**Files:**

- Modify: `components/SetupStep.tsx`

**Step 1: Update delay multiplier to match plan**

Find the motion.div transition prop and change `delay: number * 0.08` to:

```tsx
transition={{ delay: number * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
```

**Step 2: Commit**

```bash
git add components/SetupStep.tsx
git commit -m "fix: align SetupStep animation delay with plan spec"
```

---

### Task 6: Extract Shared Provider Config

**Files:**

- Create: `lib/provider-config.ts`
- Modify: `components/ModelCard.tsx`
- Modify: `app/(authenticated)/models/page.tsx`

**Step 1: Create shared provider config file**

Create `lib/provider-config.ts`:

```typescript
import { Brain, Sparkles, Zap, Cpu, LucideIcon } from "lucide-react";

export interface ProviderConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  iconColor: string;
}

export const providerConfig: Record<"claude" | "gemini" | "gpt" | "other", ProviderConfig> = {
  claude: {
    label: "Anthropic Claude",
    icon: Brain,
    color: "text-info",
    bgColor: "bg-info/5",
    borderColor: "border-info/15",
    hoverBorder: "hover:border-info/30",
    iconColor: "text-info",
  },
  gemini: {
    label: "Google Gemini",
    icon: Sparkles,
    color: "text-gold",
    bgColor: "bg-gold/5",
    borderColor: "border-gold/15",
    hoverBorder: "hover:border-gold/30",
    iconColor: "text-gold",
  },
  gpt: {
    label: "OpenAI GPT",
    icon: Zap,
    color: "text-success",
    bgColor: "bg-success/5",
    borderColor: "border-success/15",
    hoverBorder: "hover:border-success/30",
    iconColor: "text-success",
  },
  other: {
    label: "Other",
    icon: Cpu,
    color: "text-text-ghost",
    bgColor: "bg-surface-1",
    borderColor: "border-border-dim",
    hoverBorder: "hover:border-border",
    iconColor: "text-text-ghost",
  },
};

export type ProviderType = keyof typeof providerConfig;
```

**Step 2: Update ModelCard.tsx to use shared config**

```typescript
import { providerConfig, ProviderType } from "@/lib/provider-config";

// Remove the local providerConfig object
// Use providerConfig from import instead
```

**Step 3: Update models/page.tsx to use shared config**

```typescript
import { providerConfig, ProviderType } from "@/lib/provider-config";

// Remove the local providerInfo object
// Use providerConfig.claude.label, providerConfig.claude.icon, etc.
```

**Step 4: Commit**

```bash
git add lib/provider-config.ts components/ModelCard.tsx app/\(authenticated\)/models/page.tsx
git commit -m "refactor: extract shared provider config to reduce duplication"
```

---

### Task 7: Update Setup Page Icon to Match Plan

**Files:**

- Modify: `app/(authenticated)/setup/page.tsx`

**Step 1: Update icon container to use gold color**

Find the icon container div and change from info to gold:

```tsx
<div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
  <BookOpen className="w-5 h-5 text-gold" />
</div>
```

**Step 2: Commit**

```bash
git add app/\(authenticated\)/setup/page.tsx
git commit -m "fix: update setup page icon color to match plan spec"
```

---

## Final Verification

### Task 8: Build and Lint Verification

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run lint**

```bash
npm run lint
```

Note: The pre-existing lint error in `lib/auth-context.tsx` is out of scope for this fix plan.

**Step 3: Commit any final fixes**

If any issues found, fix and commit.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: complete code review fixes for luxury terminal UI"
```

---

## Summary

| Task | Type         | Description                          |
| ---- | ------------ | ------------------------------------ |
| 1    | Important    | Add missing warning color            |
| 2    | Important    | Fix undefined bg-dark-bg class       |
| 3    | Important    | Remove orphaned neon CSS classes     |
| 4    | Important    | Fix Tailwind glow keyframes color    |
| 5    | Minor        | Fix animation delay multiplier       |
| 6    | Minor        | Extract shared provider config (DRY) |
| 7    | Minor        | Update setup page icon color         |
| 8    | Verification | Build and lint check                 |

Total: 8 tasks, approximately 15-20 minutes of implementation time.
