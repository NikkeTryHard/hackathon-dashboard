"use client";

import { LogOut, Hexagon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-56 right-0 h-14 bg-surface-0 border-b border-border-dim z-40 flex items-center justify-between px-6">
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
