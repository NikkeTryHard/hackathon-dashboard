# Luxury Terminal UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the hackathon dashboard from "developer-built dark mode" to a refined "Luxury Terminal" aesthetic inspired by Bloomberg/Linear/Raycast.

**Architecture:** Complete visual overhaul touching typography (Geist + JetBrains Mono), color system (refined gold on deep obsidian), surface hierarchy (3-level depth system), and motion (spring physics with staggered reveals). All changes are CSS/component-level with no backend modifications.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion, Google Fonts (Geist, JetBrains Mono)

---

## Phase 1: Foundation (Typography & Colors)

### Task 1: Update Font Imports

**Files:**

- Modify: `app/globals.css` (lines 1-5)
- Modify: `app/layout.tsx`

**Step 1: Update Google Fonts import in globals.css**

Replace the font import at the top of `app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");
```

**Step 2: Update CSS variables for fonts**

In `app/globals.css`, update the body font-family:

```css
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family:
    "Geist",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  min-height: 100vh;
}

.font-display {
  font-family: "Geist", sans-serif;
}

.font-mono {
  font-family: "JetBrains Mono", "SF Mono", monospace;
}
```

**Step 3: Update Tailwind config fonts**

In `tailwind.config.ts`, update the fontFamily extend:

```typescript
fontFamily: {
  sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
  mono: ["JetBrains Mono", "SF Mono", "monospace"],
},
```

**Step 4: Verify fonts load**

Run: `npm run dev`
Open browser, inspect body element, confirm font-family shows "Geist"

**Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx tailwind.config.ts
git commit -m "style: replace fonts with Geist + JetBrains Mono"
```

---

### Task 2: Implement New Color System

**Files:**

- Modify: `app/globals.css` (CSS variables section)
- Modify: `tailwind.config.ts` (colors)

**Step 1: Replace CSS variables in globals.css**

Replace the entire `:root` block:

```css
:root {
  /* Luxury Terminal - Deep Obsidian Base */
  --void: #050506;
  --surface-0: #0a0a0b;
  --surface-1: #111113;
  --surface-2: #1a1a1d;

  /* Borders */
  --border-dim: #1f1f23;
  --border: #2a2a2f;
  --border-bright: #3a3a42;

  /* Text Hierarchy */
  --text-primary: #fafafa;
  --text-secondary: #a1a1a6;
  --text-tertiary: #636369;
  --text-ghost: #3a3a42;

  /* Refined Gold Accent */
  --gold: #d4a853;
  --gold-bright: #e8c06a;
  --gold-dim: #9a7b3d;
  --gold-glow: rgba(212, 168, 83, 0.15);
  --gold-subtle: rgba(212, 168, 83, 0.08);

  /* Semantic */
  --success: #3ecf8e;
  --success-dim: rgba(62, 207, 142, 0.15);
  --error: #ef5f5f;
  --error-dim: rgba(239, 95, 95, 0.15);
  --info: #6b8afd;
  --info-dim: rgba(107, 138, 253, 0.15);

  /* Legacy mappings for compatibility */
  --bg-primary: var(--void);
  --bg-elevated: var(--surface-0);
  --bg-surface: var(--surface-1);
  --border-subtle: var(--border-dim);
  --border-default: var(--border);
  --accent: var(--gold);
  --accent-dim: var(--gold-dim);
}
```

**Step 2: Update Tailwind colors**

Replace the colors in `tailwind.config.ts`:

```typescript
colors: {
  // Luxury Terminal palette
  void: "#050506",
  surface: {
    0: "#0a0a0b",
    1: "#111113",
    2: "#1a1a1d",
  },
  border: {
    dim: "#1f1f23",
    DEFAULT: "#2a2a2f",
    bright: "#3a3a42",
  },
  text: {
    primary: "#fafafa",
    secondary: "#a1a1a6",
    tertiary: "#636369",
    ghost: "#3a3a42",
  },
  gold: {
    DEFAULT: "#d4a853",
    bright: "#e8c06a",
    dim: "#9a7b3d",
  },
  success: "#3ecf8e",
  error: "#ef5f5f",
  info: "#6b8afd",
  // Keep obsidian for backward compat during migration
  obsidian: {
    50: "#fafafa",
    100: "#d4d4d8",
    200: "#a1a1aa",
    300: "#71717a",
    400: "#52525b",
    500: "#3f3f46",
    600: "#27272a",
    700: "#1c1c21",
    800: "#131316",
    900: "#0c0c0e",
    950: "#09090b",
  },
  amber: {
    200: "#fde68a",
    300: "#fcd34d",
    400: "#d4a853",
    500: "#9a7b3d",
  },
  copper: "#c77b4a",
  rose: {
    400: "#fb7185",
    500: "#f43f5e",
  },
},
```

**Step 3: Update body styles**

In `app/globals.css`, update body:

```css
body {
  background-color: var(--void);
  color: var(--text-primary);
  font-family:
    "Geist",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  min-height: 100vh;
}
```

**Step 4: Verify colors render**

Run: `npm run dev`
Check that background is deeper black (#050506), text is crisp white

**Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "style: implement refined gold color system"
```

---

### Task 3: Create New Surface Classes

**Files:**

- Modify: `app/globals.css` (surface utilities section)

**Step 1: Replace surface utility classes**

Replace the `.surface` and `.surface-raised` classes:

```css
/* Surface Hierarchy - 3 levels of depth */
.surface-base {
  background: var(--surface-0);
  border: 1px solid var(--border-dim);
  border-radius: 12px;
}

.surface-elevated {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.3);
}

.surface-floating {
  background: var(--surface-2);
  border: 1px solid var(--border-bright);
  border-radius: 12px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.03);
}

/* Legacy compat */
.surface {
  background: var(--surface-0);
  border: 1px solid var(--border-dim);
  border-radius: 12px;
}

.surface-raised {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.3);
}
```

**Step 2: Add gold accent surface**

```css
.surface-gold {
  background: var(--gold-subtle);
  border: 1px solid rgba(212, 168, 83, 0.2);
  border-radius: 12px;
}

.surface-gold-glow {
  background: var(--gold-subtle);
  border: 1px solid rgba(212, 168, 83, 0.25);
  border-radius: 12px;
  box-shadow:
    0 0 20px var(--gold-glow),
    0 4px 16px rgba(0, 0, 0, 0.3);
}
```

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add layered surface depth system"
```

---

### Task 4: Update Button Styles

**Files:**

- Modify: `app/globals.css` (button section)

**Step 1: Replace button classes**

```css
/* Primary Button - Refined Gold */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%);
  color: var(--void);
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gold-bright) 0%, var(--gold) 100%);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px var(--gold-glow),
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Secondary/Ghost Button */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  background: transparent;
  color: var(--text-secondary);
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: var(--surface-1);
  color: var(--text-primary);
  border-color: var(--border);
}

/* Outline Button */
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  color: var(--gold);
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid var(--gold-dim);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-outline:hover {
  background: var(--gold-subtle);
  border-color: var(--gold);
}
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: refine button styles with gold gradient"
```

---

### Task 5: Update Input Styles

**Files:**

- Modify: `app/globals.css` (input section)

**Step 1: Replace input classes**

```css
/* Input Field - Refined */
.input-field {
  width: 100%;
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field::placeholder {
  color: var(--text-ghost);
}

.input-field:hover:not(:focus) {
  border-color: var(--border-bright);
}

.input-field:focus {
  outline: none;
  border-color: var(--gold);
  background: var(--surface-1);
  box-shadow:
    0 0 0 3px var(--gold-glow),
    0 0 20px rgba(212, 168, 83, 0.05);
}
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: refine input field styling"
```

---

### Task 6: Update Badge & Status Indicators

**Files:**

- Modify: `app/globals.css` (badge section)

**Step 1: Replace badge and status classes**

```css
/* Badge - Refined */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-family: "Geist", sans-serif;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.badge-gold {
  background: var(--gold-subtle);
  color: var(--gold);
  border-color: rgba(212, 168, 83, 0.2);
}

.badge-success {
  background: var(--success-dim);
  color: var(--success);
  border-color: rgba(62, 207, 142, 0.2);
}

/* Status Indicators */
.status-online {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(62, 207, 142, 0.5);
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-offline {
  width: 8px;
  height: 8px;
  background: var(--text-ghost);
  border-radius: 50%;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(62, 207, 142, 0.5);
  }
  50% {
    box-shadow: 0 0 12px rgba(62, 207, 142, 0.7);
  }
}
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: refine badges and status indicators"
```

---

## Phase 2: Component Updates

### Task 7: Redesign Login Page

**Files:**

- Modify: `app/login/page.tsx`

**Step 1: Update the login page with refined styling**

Replace the entire component:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(apiKey);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid API key. Check your key and try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse at top, rgba(212, 168, 83, 0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Login card */}
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="relative z-10 w-full max-w-[400px] mx-4">
        <div className="surface-elevated p-8">
          {/* Header */}
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-6">{isAdminMode ? <Shield className="w-6 h-6 text-error" /> : <Key className="w-6 h-6 text-gold" />}</div>

            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {isAdminMode ? (
                <span className="text-error">Admin Access</span>
              ) : (
                <>
                  <span className="text-gold">hackathon</span>
                  <span className="text-text-ghost mx-1.5">/</span>
                  <span className="text-text-primary">crew</span>
                </>
              )}
            </h1>
            <p className="text-sm text-text-tertiary">{isAdminMode ? "Enter admin credentials" : "Enter your API key to continue"}</p>
          </motion.div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-text-tertiary uppercase tracking-widest">{isAdminMode ? "Admin Key" : "API Key"}</label>
              <div className="relative">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={isAdminMode ? "sk-admin-..." : "sk-ant-..."} className="input-field pl-11" autoComplete="off" spellCheck={false} autoFocus />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-ghost" />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 text-sm bg-error/10 border border-error/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <span className="text-error/90">{error}</span>
              </motion.div>
            )}

            <button type="submit" disabled={isLoading || !apiKey} className="btn-primary w-full">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div className="mt-8 pt-6 border-t border-border-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-ghost">
                Need access? <span className="text-gold/80 hover:text-gold cursor-pointer transition-colors">Ask Louis</span>
              </p>
              <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} className="btn-ghost text-xs py-1.5 px-3">
                <Shield className="w-3 h-3" />
                <span>{isAdminMode ? "User" : "Admin"}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Version */}
        <motion.div className="text-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <span className="text-[11px] text-text-ghost font-mono tracking-wide">v1.0.0</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
```

**Step 2: Verify login page renders**

Run: `npm run dev`
Navigate to `/login`, verify new styling

**Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "style: redesign login page with luxury terminal aesthetic"
```

---

### Task 8: Redesign Navbar

**Files:**

- Modify: `components/Navbar.tsx`

**Step 1: Update Navbar component**

```tsx
"use client";

import { LogOut, Hexagon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-56 right-0 h-14 bg-surface-0/90 backdrop-blur-md border-b border-border-dim z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 border border-gold/20">
          <Hexagon className="w-4 h-4 text-gold" />
        </div>
        <span className="text-sm font-medium tracking-tight">
          <span className="text-gold">hackathon</span>
          <span className="text-text-ghost mx-1">/</span>
          <span className="text-text-secondary">crew</span>
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-1 border border-border-dim">
            <div className="status-online" />
            <span className="text-sm text-text-secondary font-medium">{user.name}</span>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-1 transition-all duration-150" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add components/Navbar.tsx
git commit -m "style: redesign navbar with refined styling"
```

---

### Task 9: Redesign Sidebar

**Files:**

- Modify: `components/Sidebar.tsx`

**Step 1: Update Sidebar component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, BookOpen, Cpu, Key } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/setup", icon: BookOpen, label: "Setup Guide" },
  { href: "/models", icon: Cpu, label: "Models" },
];

const adminItems = [{ href: "/admin", icon: Key, label: "Admin" }];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = user?.isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-surface-0/60 backdrop-blur-sm border-r border-border-dim z-50 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150", isActive ? "bg-gold/10 text-gold border border-gold/20" : "text-text-tertiary hover:text-text-primary hover:bg-surface-1 border border-transparent")}>
              <item.icon className={cn("w-4 h-4", isActive ? "text-gold" : "text-text-ghost")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Online section */}
      <div className="p-4 border-t border-border-dim">
        <div className="surface-base p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="status-online" />
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-widest">Online</span>
          </div>
          <div className="flex -space-x-2" id="online-avatars">
            {/* Populated by client */}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Step 2: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "style: redesign sidebar with refined styling"
```

---

### Task 10: Redesign StatsCard

**Files:**

- Modify: `components/StatsCard.tsx`

**Step 1: Update StatsCard component**

```tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "gold" | "success" | "info" | "default";
  delay?: number;
}

const colorConfig = {
  gold: {
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    border: "border-gold/10",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    border: "border-success/10",
  },
  info: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    border: "border-info/10",
  },
  default: {
    iconBg: "bg-surface-2",
    iconColor: "text-text-tertiary",
    border: "border-border-dim",
  },
};

export function StatsCard({ icon: Icon, label, value, subtext, color = "gold", delay = 0 }: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className={cn("surface-elevated p-5 hover:border-border-bright transition-colors", config.border)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", config.iconBg)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-text-primary tracking-tight">{value}</div>
      {subtext && <div className="text-xs text-text-ghost mt-1.5">{subtext}</div>}
    </motion.div>
  );
}
```

**Step 2: Update Dashboard page to use new color prop**

In `app/(authenticated)/dashboard/page.tsx`, update the StatsCard calls:

```tsx
<StatsCard icon={Zap} label="Total Requests" value={MOCK_STATS.totalRequests.toLocaleString()} subtext="all time" color="gold" delay={0} />
<StatsCard icon={Activity} label="Active Today" value={MOCK_STATS.activeToday} subtext="crew members" color="success" delay={0.05} />
<StatsCard icon={Cpu} label="Top Model" value={MOCK_STATS.topModel} subtext="most used" color="info" delay={0.1} />
<StatsCard icon={Clock} label="Uptime" value={MOCK_STATS.uptime} subtext="this week" color="success" delay={0.15} />
```

**Step 3: Commit**

```bash
git add components/StatsCard.tsx app/(authenticated)/dashboard/page.tsx
git commit -m "style: redesign StatsCard with refined styling"
```

---

### Task 11: Redesign OnlineFriends

**Files:**

- Modify: `components/OnlineFriends.tsx`

**Step 1: Update OnlineFriends component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface OnlineFriendsProps {
  friends: Friend[];
}

export function OnlineFriends({ friends }: OnlineFriendsProps) {
  const onlineCount = friends.filter((f) => f.isOnline).length;

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10">
            <Users className="w-4 h-4 text-gold" />
          </div>
          <span className="text-sm font-medium text-text-primary">Crew Status</span>
        </div>
        <span className="badge">
          {onlineCount}/{friends.length} online
        </span>
      </div>

      <div className="space-y-2">
        {friends.map((friend, i) => (
          <motion.div key={friend.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="flex items-center justify-between p-3 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-sm font-medium text-text-secondary border border-border">{friend.name[0]}</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-1 ${friend.isOnline ? "bg-success" : "bg-text-ghost"}`} />
              </div>
              <span className="text-sm font-medium text-text-primary">{friend.name}</span>
            </div>
            <span className="text-xs text-text-ghost">{friend.isOnline ? <span className="text-success font-medium">active</span> : friend.lastSeen || "offline"}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/OnlineFriends.tsx
git commit -m "style: redesign OnlineFriends with refined styling"
```

---

### Task 12: Redesign QuickLeaderboard

**Files:**

- Modify: `components/QuickLeaderboard.tsx`

**Step 1: Update QuickLeaderboard component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
}

interface QuickLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function QuickLeaderboard({ entries }: QuickLeaderboardProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gold/15 text-gold border-gold/25";
    if (rank === 2) return "bg-surface-2 text-text-secondary border-border";
    if (rank === 3) return "bg-copper/15 text-copper border-copper/25";
    return "bg-surface-1 text-text-ghost border-border-dim";
  };

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10">
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <span className="text-sm font-medium text-text-primary">Leaderboard</span>
        </div>
        <Link href="/leaderboard" className="text-xs text-gold/70 hover:text-gold transition-colors font-medium">
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 5).map((entry, i) => (
          <motion.div key={entry.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="flex items-center justify-between p-3 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${getRankStyle(entry.rank)}`}>{entry.rank}</div>
              <div>
                <div className="text-sm font-medium text-text-primary">{entry.name}</div>
                <div className="text-xs text-text-ghost font-mono">{entry.topModel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gold">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-sm font-mono font-medium">{entry.requests.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/QuickLeaderboard.tsx
git commit -m "style: redesign QuickLeaderboard with refined styling"
```

---

### Task 13: Redesign Dashboard Page Header

**Files:**

- Modify: `app/(authenticated)/dashboard/page.tsx`

**Step 1: Update Dashboard page with refined header and spacing**

```tsx
"use client";

import { Activity, Zap, Cpu, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { OnlineFriends } from "@/components/OnlineFriends";
import { QuickLeaderboard } from "@/components/QuickLeaderboard";
import { useAuth } from "@/lib/auth-context";

const MOCK_STATS = {
  totalRequests: 1247,
  activeToday: 4,
  topModel: "claude-sonnet-4-5",
  uptime: "99.9%",
};

const MOCK_FRIENDS = [
  { id: "1", name: "Louis", isOnline: true },
  { id: "2", name: "Alice", isOnline: true },
  { id: "3", name: "Bob", isOnline: false, lastSeen: "2h ago" },
  { id: "4", name: "Charlie", isOnline: true },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice", requests: 423, topModel: "claude-opus-4" },
  { rank: 2, name: "Louis", requests: 387, topModel: "claude-sonnet-4-5" },
  { rank: 3, name: "Charlie", requests: 284, topModel: "gemini-2.5-pro" },
  { rank: 4, name: "Bob", requests: 153, topModel: "gpt-4o" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-text-ghost">~/</span>
          <span className="text-gold">dashboard</span>
        </h1>
        <p className="text-sm text-text-tertiary">
          Welcome back, <span className="text-text-secondary font-medium">{user?.name}</span>. Here&apos;s what&apos;s happening.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Zap} label="Total Requests" value={MOCK_STATS.totalRequests.toLocaleString()} subtext="all time" color="gold" delay={0} />
        <StatsCard icon={Activity} label="Active Today" value={MOCK_STATS.activeToday} subtext="crew members" color="success" delay={0.05} />
        <StatsCard icon={Cpu} label="Top Model" value={MOCK_STATS.topModel} subtext="most used" color="info" delay={0.1} />
        <StatsCard icon={Clock} label="Uptime" value={MOCK_STATS.uptime} subtext="this week" color="success" delay={0.15} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineFriends friends={MOCK_FRIENDS} />
        <QuickLeaderboard entries={MOCK_LEADERBOARD} />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/(authenticated)/dashboard/page.tsx
git commit -m "style: redesign dashboard page with refined styling"
```

---

### Task 14: Redesign LeaderboardTable

**Files:**

- Modify: `components/LeaderboardTable.tsx`

**Step 1: Update LeaderboardTable component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Zap, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
  modelsUsed: string[];
  lastActive: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-text-secondary" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-copper" />;
    return <span className="text-text-ghost font-mono">#{rank}</span>;
  };

  return (
    <div className="surface-elevated overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-[11px] text-text-tertiary uppercase tracking-widest">
            <th className="px-5 py-4 font-medium">Rank</th>
            <th className="px-5 py-4 font-medium">Hacker</th>
            <th className="px-5 py-4 font-medium">Requests</th>
            <th className="px-5 py-4 font-medium">Top Model</th>
            <th className="px-5 py-4 font-medium">Models Used</th>
            <th className="px-5 py-4 font-medium">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <motion.tr key={entry.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className={`border-b border-border-dim hover:bg-surface-1/50 transition-colors ${entry.rank === 1 ? "bg-gold/[0.03]" : ""}`}>
              <td className="px-5 py-4">{getRankDisplay(entry.rank)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-bold text-text-secondary">{entry.name[0]}</div>
                  <span className="font-medium text-text-primary">{entry.name}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-gold font-mono">
                  <Zap className="w-4 h-4" />
                  {entry.requests.toLocaleString()}
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-info font-mono">{entry.topModel}</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  {entry.modelsUsed.slice(0, 3).map((model) => (
                    <span key={model} className="badge text-[10px]">
                      {model.split("-")[0]}
                    </span>
                  ))}
                  {entry.modelsUsed.length > 3 && <span className="text-xs text-text-ghost">+{entry.modelsUsed.length - 3}</span>}
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-text-ghost">{entry.lastActive}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/LeaderboardTable.tsx
git commit -m "style: redesign LeaderboardTable with refined styling"
```

---

### Task 15: Redesign Leaderboard Page (Podium)

**Files:**

- Modify: `app/(authenticated)/leaderboard/page.tsx`

**Step 1: Update Leaderboard page with refined podium**

```tsx
"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "@/components/LeaderboardTable";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice", requests: 423, topModel: "claude-opus-4", modelsUsed: ["claude", "gemini", "gpt"], lastActive: "2 min ago" },
  { rank: 2, name: "Louis", requests: 387, topModel: "claude-sonnet-4-5", modelsUsed: ["claude", "gemini"], lastActive: "5 min ago" },
  { rank: 3, name: "Charlie", requests: 284, topModel: "gemini-2.5-pro", modelsUsed: ["gemini", "claude", "gpt"], lastActive: "1h ago" },
  { rank: 4, name: "Bob", requests: 153, topModel: "gpt-4o", modelsUsed: ["gpt", "claude"], lastActive: "3h ago" },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">leaderboard</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Who&apos;s grinding the hardest? Updated in real-time.</p>
      </motion.div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4">
        {/* 2nd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-2xl font-bold text-text-secondary mb-3">{MOCK_LEADERBOARD[1]?.name[0]}</div>
          <div className="text-text-tertiary text-2xl font-bold mb-1">2nd</div>
          <div className="font-medium text-text-primary">{MOCK_LEADERBOARD[1]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[1]?.requests} req</div>
        </motion.div>

        {/* 1st place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center border-gold/20 bg-gold/[0.03]">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-3xl font-bold text-gold mb-3">{MOCK_LEADERBOARD[0]?.name[0]}</div>
          <div className="text-gold text-3xl font-bold mb-1">1st</div>
          <div className="font-medium text-lg text-text-primary">{MOCK_LEADERBOARD[0]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[0]?.requests} req</div>
        </motion.div>

        {/* 3rd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-copper/15 border-2 border-copper/30 flex items-center justify-center text-xl font-bold text-copper mb-3">{MOCK_LEADERBOARD[2]?.name[0]}</div>
          <div className="text-copper text-xl font-bold mb-1">3rd</div>
          <div className="font-medium text-text-primary">{MOCK_LEADERBOARD[2]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[2]?.requests} req</div>
        </motion.div>
      </div>

      <LeaderboardTable entries={MOCK_LEADERBOARD} />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/(authenticated)/leaderboard/page.tsx
git commit -m "style: redesign leaderboard page with refined podium"
```

---

### Task 16: Redesign ModelCard

**Files:**

- Modify: `components/ModelCard.tsx`

**Step 1: Update ModelCard component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Cpu, Sparkles, Zap, Brain } from "lucide-react";

interface ModelCardProps {
  id: string;
  provider: "claude" | "gemini" | "gpt" | "other";
  index: number;
}

const providerConfig = {
  claude: {
    bgColor: "bg-info/5",
    borderColor: "border-info/15",
    hoverBorder: "hover:border-info/30",
    iconColor: "text-info",
    icon: Brain,
  },
  gemini: {
    bgColor: "bg-gold/5",
    borderColor: "border-gold/15",
    hoverBorder: "hover:border-gold/30",
    iconColor: "text-gold",
    icon: Sparkles,
  },
  gpt: {
    bgColor: "bg-success/5",
    borderColor: "border-success/15",
    hoverBorder: "hover:border-success/30",
    iconColor: "text-success",
    icon: Zap,
  },
  other: {
    bgColor: "bg-surface-1",
    borderColor: "border-border-dim",
    hoverBorder: "hover:border-border",
    iconColor: "text-text-ghost",
    icon: Cpu,
  },
};

export function ModelCard({ id, provider, index }: ModelCardProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  if (id.includes("*")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className={`surface-base p-4 ${config.bgColor} ${config.borderColor} ${config.hoverBorder} transition-all cursor-default`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md bg-surface-0/50 ${config.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-mono text-sm text-text-primary truncate">{id}</span>
      </div>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add components/ModelCard.tsx
git commit -m "style: redesign ModelCard with refined styling"
```

---

### Task 17: Redesign Models Page

**Files:**

- Modify: `app/(authenticated)/models/page.tsx`

**Step 1: Update Models page with refined styling**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Cpu, RefreshCw, Brain, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/ModelCard";

interface Model {
  id: string;
  object: string;
  owned_by: string;
}

function getProvider(modelId: string): "claude" | "gemini" | "gpt" | "other" {
  if (modelId.startsWith("claude")) return "claude";
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt") || modelId.startsWith("o1") || modelId.startsWith("o3")) return "gpt";
  return "other";
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8083/v1/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(data.data || []);
    } catch {
      setError("Could not fetch models. Is the endpoint running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const grouped = models.reduce(
    (acc, model) => {
      const provider = getProvider(model.id);
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );

  const providerInfo = {
    claude: { label: "Anthropic Claude", icon: Brain, color: "text-info" },
    gemini: { label: "Google Gemini", icon: Sparkles, color: "text-gold" },
    gpt: { label: "OpenAI GPT", icon: Zap, color: "text-success" },
    other: { label: "Other", icon: Cpu, color: "text-text-ghost" },
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10 border border-info/20">
              <Cpu className="w-5 h-5 text-info" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="text-text-ghost">~/</span>
              <span className="text-gold">models</span>
            </h1>
          </div>
          <p className="text-sm text-text-tertiary">{models.length} models available via Antigravity Manager</p>
        </div>

        <button onClick={fetchModels} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-1 border border-border hover:border-gold/30 hover:bg-surface-2 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 text-text-tertiary ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-sm text-text-secondary">Refresh</span>
        </button>
      </motion.div>

      {error && (
        <div className="surface-elevated p-4 border-error/20 bg-error/5">
          <p className="text-error">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-10">
          {(["claude", "gemini", "gpt", "other"] as const).map((provider) => {
            const providerModels = grouped[provider] || [];
            if (providerModels.length === 0) return null;

            const info = providerInfo[provider];
            const Icon = info.icon;

            return (
              <motion.div key={provider} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                  <h2 className="text-lg font-semibold text-text-primary">{info.label}</h2>
                  <span className="badge">{providerModels.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {providerModels
                    .filter((m) => !m.id.includes("*"))
                    .map((model, i) => (
                      <ModelCard key={model.id} id={model.id} provider={provider} index={i} />
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/(authenticated)/models/page.tsx
git commit -m "style: redesign models page with refined styling"
```

---

### Task 18: Redesign CodeBlock

**Files:**

- Modify: `components/CodeBlock.tsx`

**Step 1: Update CodeBlock component**

```tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface-base overflow-hidden">
      {filename && (
        <div className="bg-surface-1 px-4 py-2.5 flex items-center justify-between border-b border-border-dim">
          <span className="text-xs text-text-tertiary font-mono">{filename}</span>
          <span className="badge-gold text-[10px]">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono">
          <code className="text-text-secondary">{code}</code>
        </pre>
        <button onClick={handleCopy} className="absolute top-3 right-3 p-2 rounded-lg bg-surface-1/80 hover:bg-surface-2 border border-border-dim hover:border-border transition-all">
          {copied ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-4 h-4 text-success" />
            </motion.div>
          ) : (
            <Copy className="w-4 h-4 text-text-ghost" />
          )}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/CodeBlock.tsx
git commit -m "style: redesign CodeBlock with refined styling"
```

---

### Task 19: Redesign SetupStep

**Files:**

- Modify: `components/SetupStep.tsx`

**Step 1: Update SetupStep component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SetupStepProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
  completed?: boolean;
}

export function SetupStep({ number, title, description, children, completed }: SetupStepProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: number * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="relative pl-14">
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-semibold ${completed ? "bg-success/15 text-success border border-success/25" : "bg-surface-1 border border-border text-gold"}`}>{completed ? <Check className="w-5 h-5" /> : number}</div>

      <div className="absolute left-5 top-10 bottom-0 w-px bg-border-dim" />

      <div className="pb-8">
        <h3 className="font-semibold text-lg text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-tertiary mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add components/SetupStep.tsx
git commit -m "style: redesign SetupStep with refined styling"
```

---

### Task 20: Redesign Setup Page

**Files:**

- Modify: `app/(authenticated)/setup/page.tsx`

**Step 1: Update Setup page with refined styling**

Update color references from `amber-*` to `gold` and `obsidian-*` to the new text/surface system:

```tsx
"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/CodeBlock";
import { SetupStep } from "@/components/SetupStep";
import { TunnelStatus } from "@/components/TunnelStatus";

export default function SetupPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <BookOpen className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">setup</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Get Claude Code connected to our hackathon endpoints in 2 minutes.</p>
      </motion.div>

      <TunnelStatus />

      <div className="surface-elevated p-5">
        <h3 className="font-semibold text-text-primary mb-4">API Paths</h3>
        <p className="text-xs text-text-ghost mb-4">Append to tunnel URL above</p>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center p-3 rounded-lg bg-surface-0 border border-border-dim">
            <span className="text-text-tertiary">OpenAI Compatible</span>
            <code className="text-gold bg-gold/10 px-2 py-1 rounded">/v1</code>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-surface-0 border border-border-dim">
            <span className="text-text-tertiary">Anthropic</span>
            <code className="text-gold bg-gold/10 px-2 py-1 rounded">/v1/messages</code>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-surface-0 border border-border-dim">
            <span className="text-text-tertiary">Gemini</span>
            <code className="text-gold bg-gold/10 px-2 py-1 rounded">/v1beta/models</code>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SetupStep number={1} title="Install Claude Code" description="If you haven't already, install Claude Code CLI.">
          <CodeBlock code="npm install -g @anthropic-ai/claude-code" language="bash" />
          <p className="text-xs text-text-ghost mt-3">
            Or use the{" "}
            <a href="https://docs.anthropic.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-gold/80 hover:text-gold transition-colors inline-flex items-center gap-1">
              VS Code extension <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </SetupStep>

        <SetupStep number={2} title="Configure API Key" description="Set your hackathon API key (the one you used to login here).">
          <CodeBlock
            code={`# Set your API key
export ANTHROPIC_API_KEY="your-hackathon-api-key"

# Or add to your shell config (~/.bashrc, ~/.zshrc)
echo 'export ANTHROPIC_API_KEY="your-hackathon-api-key"' >> ~/.zshrc`}
            language="bash"
          />
        </SetupStep>

        <SetupStep number={3} title="Configure Endpoints" description="Point Claude Code to our hackathon proxy.">
          <p className="text-sm text-text-secondary mb-3">
            Copy the tunnel URL from above and add it to <code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded">~/.claude/settings.json</code>:
          </p>
          <CodeBlock
            code={`{
  "apiBaseUrl": "<paste-tunnel-url-from-above>",
  "model": "claude-sonnet-4-5"
}`}
            language="json"
            filename="~/.claude/settings.json"
          />
          <p className="text-xs text-gold/80 mt-3">Warning: The tunnel URL changes when the server restarts. Check this page for the latest URL.</p>
        </SetupStep>

        <SetupStep number={4} title="Verify Connection" description="Make sure everything is working.">
          <CodeBlock
            code={`# Start Claude Code
claude

# Or run a quick test
claude "Say hello if you can hear me"`}
            language="bash"
          />
          <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success">If you see a response, you&apos;re connected! Your usage will show up on the dashboard.</p>
          </div>
        </SetupStep>

        <SetupStep number={5} title="Choose Your Model" description="Pick the best model for your task.">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
              <span className="text-gold font-mono font-medium whitespace-nowrap">claude-sonnet-4-5</span>
              <span className="text-text-tertiary">Best balance of speed + quality. Recommended for most coding.</span>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
              <span className="text-info font-mono font-medium whitespace-nowrap">claude-opus-4</span>
              <span className="text-text-tertiary">Most powerful. Use for complex architecture decisions.</span>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
              <span className="text-gold-dim font-mono font-medium whitespace-nowrap">gemini-2.5-pro</span>
              <span className="text-text-tertiary">Great for long context. Good alternative.</span>
            </div>
          </div>
          <p className="text-xs text-text-ghost mt-4">
            See all available models on the{" "}
            <a href="/models" className="text-gold/80 hover:text-gold transition-colors">
              Models page
            </a>
          </p>
        </SetupStep>
      </div>

      <div className="surface-elevated p-5">
        <h3 className="font-semibold text-text-primary mb-2">Need help?</h3>
        <p className="text-sm text-text-tertiary">
          Ping <span className="text-error font-medium">@Louis</span> in Discord or check if the endpoint is up on the dashboard.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/(authenticated)/setup/page.tsx
git commit -m "style: redesign setup page with refined styling"
```

---

### Task 21: Update Authenticated Layout

**Files:**

- Modify: `app/(authenticated)/layout.tsx`

**Step 1: Update the layout with refined styling**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { PresenceProvider } from "@/components/PresenceProvider";
import { useAuth } from "@/lib/auth-context";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PresenceProvider>
      <Navbar />
      <Sidebar />
      <main className="ml-56 mt-14 p-6 min-h-screen bg-void">{children}</main>
    </PresenceProvider>
  );
}
```

**Step 2: Commit**

```bash
git add app/(authenticated)/layout.tsx
git commit -m "style: update authenticated layout with refined styling"
```

---

## Phase 3: Final Polish

### Task 22: Add Enhanced Animations to globals.css

**Files:**

- Modify: `app/globals.css`

**Step 1: Add refined animation keyframes**

Add to the animations section of `globals.css`:

```css
/* Enhanced Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 20px var(--gold-glow);
  }
  50% {
    box-shadow:
      0 0 30px var(--gold-glow),
      0 0 40px rgba(212, 168, 83, 0.1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.animate-glow {
  animation: glow 3s ease-in-out infinite;
}

/* Hover lift effect */
.hover-lift {
  transition:
    transform 0.2s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Text gradient utility */
.text-gradient-gold {
  background: linear-gradient(135deg, var(--gold-bright) 0%, var(--gold) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add enhanced animations and utilities"
```

---

### Task 23: Verify Build and Fix Any Errors

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Fix any TypeScript/ESLint errors that appear**

Check for:

- Missing imports
- Undefined color classes
- Type mismatches

**Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve build errors from redesign"
```

---

### Task 24: Visual Testing with Playwright

**Files:**

- Create: `tests/visual/ui-redesign.spec.ts` (if tests directory exists)

**Step 1: Manual visual verification**

Run: `npm run dev`

Check each page:

1. `/login` - Login page styling
2. `/dashboard` - Dashboard with stats, online friends, leaderboard
3. `/leaderboard` - Podium and table
4. `/models` - Model cards grid
5. `/setup` - Setup guide steps

Verify:

- Fonts load correctly (Geist, JetBrains Mono)
- Colors match the refined gold palette
- Surfaces have proper depth hierarchy
- Animations are smooth spring physics
- Hover states work on all interactive elements

**Step 2: Commit final state**

```bash
git add -A
git commit -m "feat: complete luxury terminal UI redesign"
```

---

## Summary

This plan transforms the hackathon dashboard from a generic dark theme to a refined "Luxury Terminal" aesthetic:

1. **Typography**: Geist + JetBrains Mono with proper hierarchy
2. **Colors**: Refined gold (#d4a853) on deep obsidian with 4-level text hierarchy
3. **Surfaces**: 3-level depth system (base, elevated, floating)
4. **Motion**: Spring physics with staggered reveals
5. **Components**: All 12 components redesigned with consistent styling

Total: 24 tasks, approximately 2-3 hours of implementation time.
