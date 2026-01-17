# Performance Optimizations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix performance issues causing slow UI updates and stutter in the hackathon dashboard.

**Architecture:** Targeted optimizations focusing on reducing unnecessary re-renders, removing GPU-intensive effects, and implementing smart polling.

**Tech Stack:** React, Next.js, Framer Motion, TypeScript

---

## Issues Identified

### Critical

1. **List animations on every item** - OnlineFriends, QuickLeaderboard, LeaderboardTable animate each row
2. **No React.memo** - Components re-render on every parent update

### Important

3. **backdrop-blur on fixed elements** - GPU-intensive effect on Navbar/Sidebar
4. **Polling continues when tab hidden** - Wastes resources when user not viewing
5. **No useMemo for data transformations** - Dashboard recalculates on every render

### Minor

6. **Inline animation objects** - New objects created on every render
7. **Missing useCallback** - Handler functions recreated unnecessarily

---

## Task 1: Remove List Animations

**Files:**

- Modify: `components/OnlineFriends.tsx`
- Modify: `components/QuickLeaderboard.tsx`
- Modify: `components/LeaderboardTable.tsx`
- Modify: `components/UserKeyCard.tsx`

Replace `motion.div`/`motion.tr` with regular `div`/`tr` for list items.

---

## Task 2: Add React.memo

**Files:**

- Modify: `components/OnlineFriends.tsx`
- Modify: `components/QuickLeaderboard.tsx`
- Modify: `components/LeaderboardTable.tsx`
- Modify: `components/StatsCard.tsx`
- Modify: `components/UserKeyCard.tsx`

Wrap all 5 components with `React.memo()`.

---

## Task 3: Remove backdrop-blur

**Files:**

- Modify: `components/Navbar.tsx`
- Modify: `components/Sidebar.tsx`

Remove `backdrop-blur-md` and `backdrop-blur-sm` classes.

---

## Task 4: Add Visibility-Based Polling

**Files:**

- Modify: `components/TunnelStatus.tsx`
- Modify: `lib/presence.ts`

Use Page Visibility API to pause polling when tab is hidden.

---

## Task 5: Add useMemo to Dashboard

**Files:**

- Modify: `app/(authenticated)/dashboard/page.tsx`

Wrap `friends` data transformation with `useMemo`.

---

## Task 6: Create Shared Animations Module

**Files:**

- Create: `lib/animations.ts`

Define reusable animation configurations to prevent object recreation.

---

## Task 7: Add useCallback to Handlers

**Files:**

- Modify: `components/TunnelStatus.tsx`
- Modify: `lib/presence.ts`

Wrap fetch and handler functions with `useCallback`.

---

## Task 8: Final Verification

Run `npm run build` to verify all changes compile successfully.

---

## Summary

| Task | Description              | Impact                                   |
| ---- | ------------------------ | ---------------------------------------- |
| 1    | Remove list animations   | High - reduces animation overhead        |
| 2    | Add React.memo           | High - prevents unnecessary re-renders   |
| 3    | Remove backdrop-blur     | Medium - reduces GPU load                |
| 4    | Visibility-based polling | Medium - saves resources when tab hidden |
| 5    | Add useMemo              | Low - optimizes data transformation      |
| 6    | Shared animations        | Low - reduces object allocations         |
| 7    | Add useCallback          | Low - stabilizes function references     |
| 8    | Verification             | Required - ensures build passes          |
