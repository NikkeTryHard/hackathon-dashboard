# Hackathon Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dark hacker-vibes dashboard for hackathon friends to view usage stats, leaderboards, Claude Code config, and available AI models.

**Architecture:** Next.js 14 App Router frontend with Tailwind CSS. Friends authenticate with API keys you provide. Dashboard fetches usage/presence data from your backend API and models from Antigravity Manager.

**Tunnel Strategy (Rate Limit Optimization):**

- **Zrok** (`https://hackathoncrew.share.zrok.io`) → Dashboard only (low traffic, permanent URL)
- **Cloudflared** (auto-managed) → AI API proxy (high traffic, URL auto-captured and displayed)

The dashboard spawns cloudflared as a child process, parses the `*.trycloudflare.com` URL from stdout, and displays it on the Setup page. Friends copy this URL for their Claude Code config. If cloudflared restarts, the new URL is auto-updated.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons, TypeScript

**Endpoints:**

- Dashboard: `https://hackathoncrew.share.zrok.io` (via Zrok)
- AI API: `https://<auto-detected>.trycloudflare.com` (via Cloudflared → localhost:8083)
- Local Antigravity: `http://127.0.0.1:8083/v1/models`

---

## Task 1: Project Setup

**Files:**

- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Step 1: Initialize Next.js project**

Run:

```bash
npx create-next-app@latest hackathon-dashboard --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Expected: Project scaffolded in `hackathon-dashboard/`

**Step 2: Install dependencies**

Run:

```bash
cd hackathon-dashboard && npm install framer-motion lucide-react
```

Expected: Dependencies added to package.json

**Step 3: Update globals.css with dark theme base**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --neon-green: #00ff00;
  --neon-purple: #9945ff;
  --neon-cyan: #00ffff;
  --dark-bg: #0a0a0a;
  --dark-card: #111111;
  --dark-border: #1a1a1a;
}

body {
  background-color: var(--dark-bg);
  color: #e0e0e0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}

/* Neon glow effects */
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

.card {
  background: var(--dark-card);
  border: 1px solid var(--dark-border);
  border-radius: 8px;
}

.card-glow {
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
}

/* Terminal cursor blink */
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.cursor-blink::after {
  content: "_";
  animation: blink 1s infinite;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--dark-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--dark-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #333;
}
```

**Step 4: Update tailwind.config.ts**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#00ff00",
          purple: "#9945ff",
          cyan: "#00ffff",
        },
        dark: {
          bg: "#0a0a0a",
          card: "#111111",
          border: "#1a1a1a",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 255, 0, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 255, 0, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 5: Commit**

```bash
git init && git add . && git commit -m "feat: initialize next.js project with dark hacker theme"
```

---

## Task 2: Cloudflared Tunnel Manager

**Files:**

- Create: `lib/tunnel-manager.ts`
- Create: `app/api/tunnel/route.ts`
- Create: `components/TunnelStatus.tsx`

**Step 1: Create tunnel manager module**

Create `lib/tunnel-manager.ts`:

```ts
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

class TunnelManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private currentUrl: string | null = null;
  private isRunning: boolean = false;
  private restartAttempts: number = 0;
  private maxRestartAttempts: number = 5;

  constructor() {
    super();
  }

  getUrl(): string | null {
    return this.currentUrl;
  }

  getStatus(): { running: boolean; url: string | null } {
    return {
      running: this.isRunning,
      url: this.currentUrl,
    };
  }

  start(): void {
    if (this.process) {
      console.log("[Tunnel] Already running");
      return;
    }

    console.log("[Tunnel] Starting cloudflared...");
    this.isRunning = false;
    this.currentUrl = null;

    this.process = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8083"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const parseUrl = (data: Buffer) => {
      const output = data.toString();
      // Cloudflared outputs the URL in format: https://xxx.trycloudflare.com
      const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (urlMatch && !this.currentUrl) {
        this.currentUrl = urlMatch[0];
        this.isRunning = true;
        this.restartAttempts = 0;
        console.log(`[Tunnel] Connected: ${this.currentUrl}`);
        this.emit("connected", this.currentUrl);
      }
    };

    this.process.stdout?.on("data", parseUrl);
    this.process.stderr?.on("data", parseUrl); // cloudflared logs to stderr

    this.process.on("close", (code) => {
      console.log(`[Tunnel] Process exited with code ${code}`);
      this.process = null;
      this.isRunning = false;
      const oldUrl = this.currentUrl;
      this.currentUrl = null;
      this.emit("disconnected", oldUrl);

      // Auto-restart with backoff
      if (this.restartAttempts < this.maxRestartAttempts) {
        this.restartAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.restartAttempts), 30000);
        console.log(`[Tunnel] Restarting in ${delay}ms (attempt ${this.restartAttempts})`);
        setTimeout(() => this.start(), delay);
      } else {
        console.error("[Tunnel] Max restart attempts reached");
        this.emit("error", new Error("Max restart attempts reached"));
      }
    });

    this.process.on("error", (err) => {
      console.error("[Tunnel] Failed to start:", err.message);
      this.emit("error", err);
    });
  }

  stop(): void {
    if (this.process) {
      console.log("[Tunnel] Stopping...");
      this.process.kill("SIGTERM");
      this.process = null;
      this.isRunning = false;
      this.currentUrl = null;
    }
  }

  restart(): void {
    this.restartAttempts = 0;
    this.stop();
    setTimeout(() => this.start(), 1000);
  }
}

// Singleton instance
export const tunnelManager = new TunnelManager();
```

**Step 2: Create tunnel API route**

Create `app/api/tunnel/route.ts`:

```ts
import { NextResponse } from "next/server";
import { tunnelManager } from "@/lib/tunnel-manager";

// Initialize tunnel on first request (server-side singleton)
let initialized = false;

function ensureInitialized() {
  if (!initialized && typeof window === "undefined") {
    tunnelManager.start();
    initialized = true;
  }
}

export async function GET() {
  ensureInitialized();
  const status = tunnelManager.getStatus();
  return NextResponse.json(status);
}

export async function POST(req: Request) {
  const { action } = await req.json();

  if (action === "restart") {
    tunnelManager.restart();
    return NextResponse.json({ message: "Restarting tunnel..." });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
```

**Step 3: Create instrumentation file to start tunnel on server boot**

Create `instrumentation.ts` in project root:

```ts
export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { tunnelManager } = await import("./lib/tunnel-manager");
    tunnelManager.start();

    // Graceful shutdown
    process.on("SIGTERM", () => {
      tunnelManager.stop();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      tunnelManager.stop();
      process.exit(0);
    });
  }
}
```

**Step 4: Enable instrumentation in next.config.js**

Update `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
```

**Step 5: Create TunnelStatus component**

Create `components/TunnelStatus.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, RefreshCw, Copy, Check, AlertCircle } from "lucide-react";

interface TunnelStatusData {
  running: boolean;
  url: string | null;
}

export function TunnelStatus() {
  const [status, setStatus] = useState<TunnelStatusData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/tunnel");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch tunnel status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    if (status?.url) {
      await navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await fetch("/api/tunnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
      // Wait a bit then refresh status
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      console.error("Failed to restart tunnel:", err);
    } finally {
      setTimeout(() => setIsRestarting(false), 5000);
    }
  };

  if (!status) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-4 bg-dark-border rounded w-1/3 mb-2" />
        <div className="h-8 bg-dark-border rounded w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`card p-4 border ${status.running ? "border-neon-green/30 bg-neon-green/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${status.running ? "text-neon-green" : "text-yellow-500"}`} />
          <span className="font-mono text-sm">{status.running ? "API Tunnel Active" : "Tunnel Connecting..."}</span>
        </div>
        <button onClick={handleRestart} disabled={isRestarting} className="p-1.5 rounded hover:bg-dark-border transition-colors disabled:opacity-50" title="Restart tunnel">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isRestarting ? "animate-spin" : ""}`} />
        </button>
      </div>

      {status.url ? (
        <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-lg font-mono text-sm">
          <code className="flex-1 text-neon-green truncate">{status.url}</code>
          <button onClick={handleCopy} className="p-1.5 rounded hover:bg-dark-border transition-colors flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Waiting for tunnel URL...</span>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">Use this URL in your Claude Code config for API access</p>
    </motion.div>
  );
}
```

**Step 6: Commit**

```bash
git add . && git commit -m "feat: add cloudflared tunnel manager with auto-restart"
```

---

## Task 3: Layout & Navigation

**Files:**

- Modify: `app/layout.tsx`
- Create: `components/Navbar.tsx`
- Create: `components/Sidebar.tsx`

**Step 1: Create Navbar component**

Create `components/Navbar.tsx`:

```tsx
"use client";

import { Terminal, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-dark-card border-b border-dark-border z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Terminal className="w-6 h-6 text-neon-green" />
        <span className="font-mono text-lg">
          <span className="neon-green">hackathon</span>
          <span className="text-gray-500">@</span>
          <span className="text-neon-purple">crew</span>
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-gray-400">{user.name}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-dark-border rounded-lg transition-colors">
            <LogOut className="w-4 h-4 text-gray-500 hover:text-neon-purple" />
          </button>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Create Sidebar component**

Create `components/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, BookOpen, Cpu, Key } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
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
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-dark-card border-r border-dark-border p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-sm transition-all", isActive ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : "text-gray-400 hover:text-gray-200 hover:bg-dark-border")}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Online friends indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="card p-3">
          <div className="text-xs text-gray-500 mb-2">ONLINE NOW</div>
          <div className="flex -space-x-2" id="online-avatars">
            {/* Populated by client */}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Step 3: Create utils helper**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Install clsx and tailwind-merge**

Run:

```bash
npm install clsx tailwind-merge
```

**Step 5: Update layout.tsx**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth-context";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hackathon Dashboard",
  description: "Claude Code access dashboard for the crew",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <AuthProvider>
          <Navbar />
          <Sidebar />
          <main className="ml-56 mt-14 p-6 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Step 6: Commit**

```bash
git add . && git commit -m "feat: add navbar and sidebar navigation"
```

---

## Task 3: Auth Context (API Key Login)

**Files:**

- Create: `lib/auth-context.tsx`
- Create: `app/login/page.tsx`
- Create: `components/ProtectedRoute.tsx`

**Step 1: Create auth context**

Create `lib/auth-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  apiKey: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem("hackathon-user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      // Call your backend to validate API key and get user info
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) return false;

      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("hackathon-user", JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hackathon-user");
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Step 2: Create login page**

Create `app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Key, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(apiKey);

    if (success) {
      router.push("/");
    } else {
      setError("Invalid API key. Ask Louis for access.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Terminal header */}
        <div className="card card-glow overflow-hidden">
          <div className="bg-dark-border px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500">hackathon-auth</span>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-8 h-8 text-neon-green" />
              <div>
                <h1 className="text-xl font-bold neon-green cursor-blink">Access Terminal</h1>
                <p className="text-sm text-gray-500">Enter your API key to continue</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <span className="text-neon-purple">$</span> api_key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-..." className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-neon-green transition-colors" />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <button type="submit" disabled={isLoading || !apiKey} className="w-full py-3 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded-lg font-mono text-sm hover:bg-neon-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "$ authenticate"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-dark-border">
              <p className="text-xs text-gray-500 text-center">
                Don't have a key? <span className="text-neon-purple">Ask Louis</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

**Step 3: Create login API route (mock for now)**

Create `app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

// Mock users - replace with your actual backend call
const MOCK_USERS: Record<string, { id: string; name: string; isAdmin: boolean }> = {
  "sk-hackathon-louis": { id: "1", name: "Louis", isAdmin: true },
  "sk-hackathon-alice": { id: "2", name: "Alice", isAdmin: false },
  "sk-hackathon-bob": { id: "3", name: "Bob", isAdmin: false },
  "sk-hackathon-charlie": { id: "4", name: "Charlie", isAdmin: false },
};

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  // TODO: Replace with actual backend validation
  const user = MOCK_USERS[apiKey];

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return NextResponse.json({
    ...user,
    apiKey: apiKey.slice(0, 12) + "...", // Masked for display
  });
}
```

**Step 4: Commit**

```bash
git add . && git commit -m "feat: add API key authentication flow"
```

---

## Task 4: Dashboard Home Page

**Files:**

- Modify: `app/page.tsx`
- Create: `components/StatsCard.tsx`
- Create: `components/OnlineFriends.tsx`
- Create: `components/QuickLeaderboard.tsx`

**Step 1: Create StatsCard component**

Create `components/StatsCard.tsx`:

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
  color?: "green" | "purple" | "cyan";
}

export function StatsCard({ icon: Icon, label, value, subtext, color = "green" }: StatsCardProps) {
  const colorClasses = {
    green: "text-neon-green border-neon-green/30 bg-neon-green/5",
    purple: "text-neon-purple border-neon-purple/30 bg-neon-purple/5",
    cyan: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5",
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("card p-4 border", colorClasses[color])}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </motion.div>
  );
}
```

**Step 2: Create OnlineFriends component**

Create `components/OnlineFriends.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Users, Circle } from "lucide-react";

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
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          <span className="font-mono text-sm">crew.status</span>
        </div>
        <span className="text-xs text-gray-500">
          {onlineCount}/{friends.length} online
        </span>
      </div>

      <div className="space-y-3">
        {friends.map((friend, i) => (
          <motion.div key={friend.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-sm">{friend.name[0]}</div>
                <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${friend.isOnline ? "fill-neon-green text-neon-green" : "fill-gray-600 text-gray-600"}`} />
              </div>
              <span className="text-sm">{friend.name}</span>
            </div>
            <span className="text-xs text-gray-500">{friend.isOnline ? <span className="text-neon-green">active</span> : friend.lastSeen || "offline"}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Create QuickLeaderboard component**

Create `components/QuickLeaderboard.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp } from "lucide-react";
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
  const getRankIcon = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-mono text-sm">leaderboard.top</span>
        </div>
        <Link href="/leaderboard" className="text-xs text-neon-purple hover:underline">
          view all →
        </Link>
      </div>

      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, i) => (
          <motion.div key={entry.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-border/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${getRankIcon(entry.rank)}`}>#{entry.rank}</span>
              <div>
                <div className="text-sm font-medium">{entry.name}</div>
                <div className="text-xs text-gray-500">{entry.topModel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-neon-green">
              <Zap className="w-3 h-3" />
              <span className="text-sm font-mono">{entry.requests}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create dashboard page**

Replace `app/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Cpu, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { OnlineFriends } from "@/components/OnlineFriends";
import { QuickLeaderboard } from "@/components/QuickLeaderboard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Mock data - replace with API calls to your backend
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
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          <span className="text-gray-500">~/</span>
          <span className="neon-green cursor-blink">dashboard</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user.name}. Here's what's happening.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Zap} label="Total Requests" value={MOCK_STATS.totalRequests.toLocaleString()} subtext="all time" color="green" />
        <StatsCard icon={Activity} label="Active Today" value={MOCK_STATS.activeToday} subtext="crew members" color="cyan" />
        <StatsCard icon={Cpu} label="Top Model" value={MOCK_STATS.topModel} subtext="most used" color="purple" />
        <StatsCard icon={Clock} label="Uptime" value={MOCK_STATS.uptime} subtext="this week" color="green" />
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

**Step 5: Commit**

```bash
git add . && git commit -m "feat: add dashboard home with stats, friends, and leaderboard"
```

---

## Task 5: Leaderboard Page

**Files:**

- Create: `app/leaderboard/page.tsx`
- Create: `components/LeaderboardTable.tsx`

**Step 1: Create LeaderboardTable component**

Create `components/LeaderboardTable.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, Crown, Medal } from "lucide-react";

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
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-mono">#{rank}</span>;
  };

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Hacker</th>
            <th className="px-4 py-3">Requests</th>
            <th className="px-4 py-3">Top Model</th>
            <th className="px-4 py-3">Models Used</th>
            <th className="px-4 py-3">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <motion.tr key={entry.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`border-b border-dark-border/50 hover:bg-dark-border/30 transition-colors ${entry.rank === 1 ? "bg-yellow-400/5" : ""}`}>
              <td className="px-4 py-4">{getRankDisplay(entry.rank)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-sm font-bold">{entry.name[0]}</div>
                  <span className="font-medium">{entry.name}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1 text-neon-green font-mono">
                  <Zap className="w-4 h-4" />
                  {entry.requests.toLocaleString()}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-neon-purple">{entry.topModel}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  {entry.modelsUsed.slice(0, 3).map((model) => (
                    <span key={model} className="px-2 py-0.5 text-xs bg-dark-border rounded">
                      {model.split("-")[0]}
                    </span>
                  ))}
                  {entry.modelsUsed.length > 3 && <span className="px-2 py-0.5 text-xs text-gray-500">+{entry.modelsUsed.length - 3}</span>}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">{entry.lastActive}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Create leaderboard page**

Create `app/leaderboard/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Mock data - replace with API calls
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    name: "Alice",
    requests: 423,
    topModel: "claude-opus-4",
    modelsUsed: ["claude", "gemini", "gpt"],
    lastActive: "2 min ago",
  },
  {
    rank: 2,
    name: "Louis",
    requests: 387,
    topModel: "claude-sonnet-4-5",
    modelsUsed: ["claude", "gemini"],
    lastActive: "5 min ago",
  },
  {
    rank: 3,
    name: "Charlie",
    requests: 284,
    topModel: "gemini-2.5-pro",
    modelsUsed: ["gemini", "claude", "gpt"],
    lastActive: "1h ago",
  },
  {
    rank: 4,
    name: "Bob",
    requests: 153,
    topModel: "gpt-4o",
    modelsUsed: ["gpt", "claude"],
    lastActive: "3h ago",
  },
];

export default function LeaderboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">leaderboard</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Who's grinding the hardest? Updated in real-time.</p>
      </motion.div>

      {/* Podium for top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-4 text-center mt-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-400/20 flex items-center justify-center text-2xl font-bold mb-2">{MOCK_LEADERBOARD[1]?.name[0]}</div>
          <div className="text-gray-400 text-2xl font-bold">2nd</div>
          <div className="font-medium">{MOCK_LEADERBOARD[1]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[1]?.requests} req</div>
        </motion.div>

        {/* 1st place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-4 text-center border-yellow-400/30 bg-yellow-400/5">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center text-3xl font-bold mb-2">{MOCK_LEADERBOARD[0]?.name[0]}</div>
          <div className="text-yellow-400 text-3xl font-bold">1st</div>
          <div className="font-medium text-lg">{MOCK_LEADERBOARD[0]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[0]?.requests} req</div>
        </motion.div>

        {/* 3rd place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-4 text-center mt-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/20 flex items-center justify-center text-xl font-bold mb-2">{MOCK_LEADERBOARD[2]?.name[0]}</div>
          <div className="text-amber-600 text-xl font-bold">3rd</div>
          <div className="font-medium">{MOCK_LEADERBOARD[2]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[2]?.requests} req</div>
        </motion.div>
      </div>

      {/* Full table */}
      <LeaderboardTable entries={MOCK_LEADERBOARD} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add . && git commit -m "feat: add leaderboard page with podium and table"
```

---

## Task 6: Setup Guide Page

**Files:**

- Create: `app/setup/page.tsx`
- Create: `components/CodeBlock.tsx`
- Create: `components/SetupStep.tsx`

**Step 1: Create CodeBlock component**

Create `components/CodeBlock.tsx`:

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
    <div className="card overflow-hidden">
      {filename && (
        <div className="bg-dark-border px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">{filename}</span>
          <span className="text-xs text-neon-purple">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-gray-300">{code}</code>
        </pre>
        <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-lg bg-dark-border hover:bg-dark-border/80 transition-colors">
          {copied ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-4 h-4 text-neon-green" />
            </motion.div>
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create SetupStep component**

Create `components/SetupStep.tsx`:

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: number * 0.1 }} className="relative pl-12">
      {/* Step number */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${completed ? "bg-neon-green/20 text-neon-green border border-neon-green/30" : "bg-dark-card border border-dark-border text-gray-400"}`}>{completed ? <Check className="w-4 h-4" /> : number}</div>

      {/* Connector line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-dark-border" />

      <div className="pb-8">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
```

**Step 3: Create setup page**

Create `app/setup/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/CodeBlock";
import { SetupStep } from "@/components/SetupStep";
import { TunnelStatus } from "@/components/TunnelStatus";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-neon-cyan" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">setup</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Get Claude Code connected to our hackathon endpoints in 2 minutes.</p>
      </motion.div>

      {/* Live Tunnel URL - Auto-managed cloudflared */}
      <TunnelStatus />

      {/* Endpoint paths info */}
      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold text-gray-300 mb-3">API Paths (append to tunnel URL above)</h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">OpenAI Compatible:</span>
            <code className="text-neon-green">/v1</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Anthropic:</span>
            <code className="text-neon-green">/v1/messages</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gemini:</span>
            <code className="text-neon-green">/v1beta/models</code>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="mt-8">
        <SetupStep number={1} title="Install Claude Code" description="If you haven't already, install Claude Code CLI.">
          <CodeBlock code="npm install -g @anthropic-ai/claude-code" language="bash" />
          <p className="text-xs text-gray-500 mt-2">
            Or use the{" "}
            <a href="https://docs.anthropic.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:underline inline-flex items-center gap-1">
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
          <p className="text-sm text-gray-400 mb-3">
            Copy the tunnel URL from above and add it to <code className="text-neon-cyan">~/.claude/settings.json</code>:
          </p>
          <CodeBlock
            code={`{
  "apiBaseUrl": "<paste-tunnel-url-from-above>",
  "model": "claude-sonnet-4-5"
}`}
            language="json"
            filename="~/.claude/settings.json"
          />
          <p className="text-xs text-yellow-500 mt-2">⚠️ The tunnel URL changes when the server restarts. Check this page for the latest URL.</p>
        </SetupStep>

        <SetupStep number={4} title="Verify Connection" description="Make sure everything is working.">
          <CodeBlock
            code={`# Start Claude Code
claude

# Or run a quick test
claude "Say hello if you can hear me"`}
            language="bash"
          />
          <div className="mt-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <p className="text-sm text-neon-green">If you see a response, you're connected! Your usage will show up on the dashboard.</p>
          </div>
        </SetupStep>

        <SetupStep number={5} title="Choose Your Model" description="Pick the best model for your task.">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-green font-mono">claude-sonnet-4-5</span>
              <span className="text-gray-400">Best balance of speed + quality. Recommended for most coding.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-purple font-mono">claude-opus-4</span>
              <span className="text-gray-400">Most powerful. Use for complex architecture decisions.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-cyan font-mono">gemini-2.5-pro</span>
              <span className="text-gray-400">Great for long context. Good alternative.</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            See all available models on the{" "}
            <a href="/models" className="text-neon-purple hover:underline">
              Models page
            </a>
          </p>
        </SetupStep>
      </div>

      {/* Help section */}
      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold mb-2">Need help?</h3>
        <p className="text-sm text-gray-400">
          Ping <span className="text-neon-purple">@Louis</span> in Discord or check if the endpoint is up on the dashboard.
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add . && git commit -m "feat: add setup guide page with copy-paste endpoints"
```

---

## Task 7: Models Page

**Files:**

- Create: `app/models/page.tsx`
- Create: `components/ModelCard.tsx`

**Step 1: Create ModelCard component**

Create `components/ModelCard.tsx`:

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
    color: "neon-purple",
    bgColor: "bg-neon-purple/10",
    borderColor: "border-neon-purple/30",
    icon: Brain,
  },
  gemini: {
    color: "neon-cyan",
    bgColor: "bg-neon-cyan/10",
    borderColor: "border-neon-cyan/30",
    icon: Sparkles,
  },
  gpt: {
    color: "neon-green",
    bgColor: "bg-neon-green/10",
    borderColor: "border-neon-green/30",
    icon: Zap,
  },
  other: {
    color: "gray-400",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
    icon: Cpu,
  },
};

export function ModelCard({ id, provider, index }: ModelCardProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  // Skip wildcard models in display
  if (id.includes("*")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className={`card p-3 border ${config.borderColor} ${config.bgColor} hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 text-${config.color}`} />
        <span className="font-mono text-sm truncate">{id}</span>
      </div>
    </motion.div>
  );
}
```

**Step 2: Create models page**

Create `app/models/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Cpu, RefreshCw, Brain, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/ModelCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8083/v1/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(data.data || []);
    } catch (err) {
      setError("Could not fetch models. Is the endpoint running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchModels();
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  // Group models by provider
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
    claude: { label: "Anthropic Claude", icon: Brain, color: "text-neon-purple" },
    gemini: { label: "Google Gemini", icon: Sparkles, color: "text-neon-cyan" },
    gpt: { label: "OpenAI GPT", icon: Zap, color: "text-neon-green" },
    other: { label: "Other", icon: Cpu, color: "text-gray-400" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-neon-purple" />
            <h1 className="text-2xl font-bold">
              <span className="text-gray-500">~/</span>
              <span className="neon-green">models</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">{models.length} models available via Antigravity Manager</p>
        </div>

        <button onClick={fetchModels} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-card border border-dark-border hover:border-neon-green/30 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="card p-4 border border-red-500/30 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
        </div>
      )}

      {/* Models by provider */}
      {!isLoading && !error && (
        <div className="space-y-8">
          {(["claude", "gemini", "gpt", "other"] as const).map((provider) => {
            const providerModels = grouped[provider] || [];
            if (providerModels.length === 0) return null;

            const info = providerInfo[provider];
            const Icon = info.icon;

            return (
              <motion.div key={provider} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                  <h2 className="text-lg font-bold">{info.label}</h2>
                  <span className="text-sm text-gray-500">({providerModels.length})</span>
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

**Step 3: Commit**

```bash
git add . && git commit -m "feat: add models page with live fetch from Antigravity"
```

---

## Task 8: Admin Page (API Keys Management)

**Files:**

- Create: `app/admin/page.tsx`
- Create: `components/UserKeyCard.tsx`

**Step 1: Create UserKeyCard component**

Create `components/UserKeyCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Eye, EyeOff, Trash2 } from "lucide-react";

interface UserKeyCardProps {
  user: {
    id: string;
    name: string;
    apiKey: string;
    requests: number;
    createdAt: string;
  };
  onDelete?: (id: string) => void;
}

export function UserKeyCard({ user, onDelete }: UserKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = user.apiKey.slice(0, 12) + "..." + user.apiKey.slice(-4);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-lg font-bold text-neon-purple">{user.name[0]}</div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">
              {user.requests} requests · Created {user.createdAt}
            </div>
          </div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(user.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-lg font-mono text-sm">
        <span className="flex-1 truncate">{showKey ? user.apiKey : maskedKey}</span>
        <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded hover:bg-dark-border transition-colors">
          {showKey ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
        </button>
        <button onClick={handleCopy} className="p-1.5 rounded hover:bg-dark-border transition-colors">
          {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
    </motion.div>
  );
}
```

**Step 2: Create admin page**

Create `app/admin/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { UserKeyCard } from "@/components/UserKeyCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Mock data - replace with your backend API
const MOCK_USERS = [
  {
    id: "1",
    name: "Louis",
    apiKey: "sk-hackathon-louis-abc123def456",
    requests: 387,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    name: "Alice",
    apiKey: "sk-hackathon-alice-xyz789ghi012",
    requests: 423,
    createdAt: "2 days ago",
  },
  {
    id: "3",
    name: "Bob",
    apiKey: "sk-hackathon-bob-jkl345mno678",
    requests: 153,
    createdAt: "1 day ago",
  },
  {
    id: "4",
    name: "Charlie",
    apiKey: "sk-hackathon-charlie-pqr901stu234",
    requests: 284,
    createdAt: "1 day ago",
  },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  const [newUserName, setNewUserName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.isAdmin) return null;

  const generateKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "sk-hackathon-";
    result += newUserName.toLowerCase() + "-";
    for (let i = 0; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;

    const newUser = {
      id: Date.now().toString(),
      name: newUserName,
      apiKey: generateKey(),
      requests: 0,
      createdAt: "just now",
    };

    setUsers([...users, newUser]);
    setNewUserName("");
    setIsCreating(false);

    // TODO: Call your backend API to persist
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure? This will revoke their access.")) {
      setUsers(users.filter((u) => u.id !== id));
      // TODO: Call your backend API to delete
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-neon-purple" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">admin</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage API keys for your hackathon crew.</p>
      </motion.div>

      {/* Add user section */}
      <div className="card p-4 border border-neon-purple/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-neon-purple" />
            API Keys
          </h3>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm hover:bg-neon-green/20 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>

        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-4 bg-dark-bg rounded-lg">
            <label className="block text-sm text-gray-400 mb-2">Friend's name</label>
            <div className="flex gap-2">
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dave" className="flex-1 bg-dark-card border border-dark-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-neon-green transition-colors" autoFocus />
              <button onClick={handleCreateUser} disabled={!newUserName.trim()} className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green text-sm hover:bg-neon-green/30 transition-colors disabled:opacity-50">
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewUserName("");
                }}
                className="px-4 py-2 rounded-lg bg-dark-card text-gray-400 text-sm hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {users.map((u) => (
            <UserKeyCard key={u.id} user={u} onDelete={u.id !== user.id ? handleDeleteUser : undefined} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold mb-2 text-sm">How it works</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Create a key for each friend</li>
          <li>• Share the key with them (securely!)</li>
          <li>• They use it to login here and configure Claude Code</li>
          <li>• Usage is tracked per key in your backend</li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add . && git commit -m "feat: add admin page for API key management"
```

---

## Task 9: Heartbeat & Presence System

**Files:**

- Create: `lib/presence.ts`
- Create: `app/api/presence/route.ts`
- Modify: `app/layout.tsx`

**Step 1: Create presence hook**

Create `lib/presence.ts`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./auth-context";

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 30 seconds
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Send offline signal on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Best effort offline signal
      navigator.sendBeacon?.("/api/presence", JSON.stringify({ userId: user.id, offline: true }));
    };
  }, [user]);
}
```

**Step 2: Create presence API route**

Create `app/api/presence/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

// In-memory store (replace with your DB)
const presenceStore = new Map<string, { lastSeen: number; online: boolean }>();

export async function POST(req: NextRequest) {
  try {
    const { userId, offline } = await req.json();

    if (offline) {
      presenceStore.set(userId, { lastSeen: Date.now(), online: false });
    } else {
      presenceStore.set(userId, { lastSeen: Date.now(), online: true });
    }

    // TODO: Persist to your backend

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // Clean up stale entries (offline if no heartbeat in 60s)
  const now = Date.now();
  const staleThreshold = 60000;

  const presence: Record<string, boolean> = {};

  presenceStore.forEach((value, key) => {
    const isOnline = value.online && now - value.lastSeen < staleThreshold;
    presence[key] = isOnline;
  });

  return NextResponse.json(presence);
}
```

**Step 3: Create PresenceProvider component**

Create `components/PresenceProvider.tsx`:

```tsx
"use client";

import { usePresence } from "@/lib/presence";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresence();
  return <>{children}</>;
}
```

**Step 4: Update layout to include presence**

Modify `app/layout.tsx` to wrap with PresenceProvider:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/components/PresenceProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hackathon Dashboard",
  description: "Claude Code access dashboard for the crew",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <AuthProvider>
          <PresenceProvider>
            <Navbar />
            <Sidebar />
            <main className="ml-56 mt-14 p-6 min-h-screen">{children}</main>
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Step 5: Commit**

```bash
git add . && git commit -m "feat: add heartbeat presence system for online status"
```

---

## Task 10: Login Page Layout Fix

**Files:**

- Create: `app/login/layout.tsx`

**Step 1: Create login-specific layout (no sidebar/navbar)**

Create `app/login/layout.tsx`:

```tsx
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 bg-dark-bg">{children}</div>;
}
```

**Step 2: Update main layout to conditionally show nav**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hackathon Dashboard",
  description: "Claude Code access dashboard for the crew",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased bg-dark-bg`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Step 3: Create authenticated layout**

Create `app/(authenticated)/layout.tsx`:

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PresenceProvider>
      <Navbar />
      <Sidebar />
      <main className="ml-56 mt-14 p-6 min-h-screen">{children}</main>
    </PresenceProvider>
  );
}
```

**Step 4: Move pages under authenticated route group**

Move files:

- `app/page.tsx` → `app/(authenticated)/page.tsx`
- `app/leaderboard/page.tsx` → `app/(authenticated)/leaderboard/page.tsx`
- `app/setup/page.tsx` → `app/(authenticated)/setup/page.tsx`
- `app/models/page.tsx` → `app/(authenticated)/models/page.tsx`
- `app/admin/page.tsx` → `app/(authenticated)/admin/page.tsx`

**Step 5: Simplify page components (remove auth checks)**

Each page can remove the auth redirect logic since the layout handles it.

**Step 6: Commit**

```bash
git add . && git commit -m "refactor: add route groups for auth/unauth layouts"
```

---

## Task 11: Final Polish & Run

**Step 1: Verify project runs**

Run:

```bash
cd hackathon-dashboard && npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 2: Test login flow**

1. Visit http://localhost:3000 → redirects to /login
2. Enter `sk-hackathon-louis` → logs in as admin
3. Navigate through all pages
4. Check models page fetches from Antigravity

**Step 3: Start Zrok tunnel**

In another terminal:

```bash
zrok share reserved hackathoncrew
```

**Step 4: Verify public access**

Visit https://hackathoncrew.share.zrok.io

**Step 5: Final commit**

```bash
git add . && git commit -m "feat: complete hackathon dashboard v1"
```

---

## Summary

**Pages built:**

1. **Login** — API key authentication with terminal aesthetic
2. **Dashboard** — Stats cards, online friends, quick leaderboard
3. **Leaderboard** — Podium + full rankings table
4. **Setup Guide** — Step-by-step Claude Code configuration with live tunnel URL
5. **Models** — Live fetch from Antigravity, grouped by provider
6. **Admin** — Create/delete API keys for friends

**Features:**

- Dark hacker aesthetic with neon accents
- API key authentication
- 30-second heartbeat presence system
- **Auto-managed cloudflared tunnel** — spawns on server start, auto-restarts, URL auto-detected
- Live model fetching from Antigravity Manager
- Copy-paste friendly code blocks
- Framer Motion animations
- Responsive layout

**Tunnel Architecture (Rate Limit Optimization):**

- **Zrok** (`https://hackathoncrew.share.zrok.io`) → Dashboard only (low traffic, permanent URL)
- **Cloudflared** (auto-managed) → AI API proxy (high traffic, dynamic URL displayed on Setup page)

**Your backend needs to provide:**

- `POST /api/auth/login` — validate API key, return user
- `GET /api/users` — list users with usage stats
- `POST /api/presence` — heartbeat endpoint
- `GET /api/presence` — who's online

**Endpoints:**

- Dashboard: `https://hackathoncrew.share.zrok.io` (via Zrok)
- AI API: `https://<auto-detected>.trycloudflare.com` (via Cloudflared → localhost:8083)
- Local Antigravity: `http://127.0.0.1:8083`

**To start everything:**

```bash
# Terminal 1: Start the dashboard (also starts cloudflared automatically)
cd hackathon-dashboard && npm run dev

# Terminal 2: Start zrok tunnel for dashboard
zrok share reserved hackathoncrew
```
