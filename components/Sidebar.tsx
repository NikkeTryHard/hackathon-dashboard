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
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-dark-card border-r border-dark-border p-4 z-50">
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
