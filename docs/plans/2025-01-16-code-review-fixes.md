# Code Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 4 issues identified in code review before merging production-mode branch.

**Architecture:** Extract shared utility, add error handling to APIs and JSON parsing.

**Tech Stack:** TypeScript, Next.js, Prisma

---

## Issues to Fix

| #   | Priority  | Issue                                     | Files Affected                         |
| --- | --------- | ----------------------------------------- | -------------------------------------- |
| 1   | Important | DRY violation - `getRawApiKey` duplicated | 3 page files → new lib/api-utils.ts    |
| 2   | Important | Missing 404 on delete non-existent user   | app/api/users/[id]/route.ts            |
| 3   | Important | Negative tokens allowed in track API      | app/api/track/route.ts                 |
| 4   | Minor     | JSON.parse without try-catch              | lib/api-utils.ts, lib/auth-context.tsx |

---

### Task 1: Create Shared API Utils with Safe JSON Parsing

**Files:**

- Create: `lib/api-utils.ts`

**Step 1: Create the shared utility file**

```typescript
// lib/api-utils.ts

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get raw API key from localStorage for authenticated API calls
 */
export function getRawApiKey(): string {
  if (typeof window === "undefined") return "";

  const rawKey = localStorage.getItem("hackathon-raw-key");
  if (rawKey) return rawKey;

  const stored = localStorage.getItem("hackathon-user");
  if (stored) {
    const parsed = safeJsonParse<{ apiKey?: string }>(stored, {});
    return parsed.apiKey || "";
  }
  return "";
}
```

**Step 2: Verify file created**

Run: `cat lib/api-utils.ts`
Expected: File contents shown

**Step 3: Commit**

```bash
git add lib/api-utils.ts
git commit -m "refactor: extract getRawApiKey to shared utility

- Create lib/api-utils.ts with getRawApiKey function
- Add safeJsonParse helper for error-safe JSON parsing
- Fixes DRY violation from code review

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Update Dashboard Page to Use Shared Utility

**Files:**

- Modify: `app/(authenticated)/dashboard/page.tsx`

**Step 1: Update imports and remove duplicated function**

Replace:

```typescript
// Get raw API key from localStorage
const getRawApiKey = () => {
  if (typeof window === "undefined") return "";
  const rawKey = localStorage.getItem("hackathon-raw-key");
  if (rawKey) return rawKey;

  const stored = localStorage.getItem("hackathon-user");
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.apiKey || "";
  }
  return "";
};
```

With:

```typescript
import { getRawApiKey } from "@/lib/api-utils";
```

(Add to imports section, remove the local function definition)

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add app/(authenticated)/dashboard/page.tsx
git commit -m "refactor: use shared getRawApiKey in dashboard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Update Leaderboard Page to Use Shared Utility

**Files:**

- Modify: `app/(authenticated)/leaderboard/page.tsx`

**Step 1: Update imports and remove duplicated function**

Replace the local `getRawApiKey` function with import from `@/lib/api-utils`.

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add app/(authenticated)/leaderboard/page.tsx
git commit -m "refactor: use shared getRawApiKey in leaderboard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Update Admin Page to Use Shared Utility

**Files:**

- Modify: `app/(authenticated)/admin/page.tsx`

**Step 1: Update imports and remove duplicated function**

The admin page has the function inside the component. Move the import to the top and remove the local function.

Note: Admin version doesn't have the `typeof window` check since it's inside a component, but the shared utility handles this.

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add app/(authenticated)/admin/page.tsx
git commit -m "refactor: use shared getRawApiKey in admin page

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Add 404 Handling for User Deletion

**Files:**

- Modify: `app/api/users/[id]/route.ts`

**Step 1: Update delete logic to handle non-existent user**

Replace:

```typescript
await prisma.user.delete({
  where: { id },
});

return NextResponse.json({ success: true });
```

With:

```typescript
// Check if user exists first
const userToDelete = await prisma.user.findUnique({
  where: { id },
});

if (!userToDelete) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

await prisma.user.delete({
  where: { id },
});

return NextResponse.json({ success: true });
```

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add app/api/users/[id]/route.ts
git commit -m "fix: return 404 when deleting non-existent user

- Check if user exists before attempting delete
- Return proper 404 status instead of Prisma error

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Add Token Validation to Track API

**Files:**

- Modify: `app/api/track/route.ts`

**Step 1: Update tokens validation**

Replace:

```typescript
tokens: tokens || 0,
```

With:

```typescript
tokens: typeof tokens === "number" && tokens >= 0 ? Math.floor(tokens) : 0,
```

This ensures:

- Only valid numbers are accepted
- Negative values are rejected (default to 0)
- Decimals are floored to integers

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add app/api/track/route.ts
git commit -m "fix: validate tokens in track API

- Reject negative token values
- Floor decimal values to integers
- Default to 0 for invalid input

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Add Safe JSON Parsing to Auth Context

**Files:**

- Modify: `lib/auth-context.tsx`

**Step 1: Import safeJsonParse and use it**

Add import:

```typescript
import { safeJsonParse } from "@/lib/api-utils";
```

Replace line 33:

```typescript
setUser(JSON.parse(stored));
```

With:

```typescript
setUser(safeJsonParse(stored, null));
```

**Step 2: Verify build passes**

Run: `npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"`
Expected: "✓ Compiled successfully"

**Step 3: Commit**

```bash
git add lib/auth-context.tsx
git commit -m "fix: use safe JSON parsing in auth context

- Prevent crash on malformed localStorage data
- Gracefully handle JSON parse errors

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Final Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: All routes compile successfully

**Step 2: Check git log**

Run: `git log --oneline -10`
Expected: 7 new commits for fixes

**Step 3: Verify no remaining duplicates**

Run: `grep -r "const getRawApiKey" app/`
Expected: No output (all duplicates removed)

---

## Summary

After completing all tasks:

- ✅ DRY violation fixed (shared utility)
- ✅ 404 handling added for user deletion
- ✅ Token validation added
- ✅ Safe JSON parsing throughout

Ready for `superpowers:finishing-a-development-branch`.
