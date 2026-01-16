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
    </aside>
  );
}
