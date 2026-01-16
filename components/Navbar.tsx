"use client";

import { Terminal, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-56 right-0 h-14 bg-dark-card border-b border-dark-border z-40 flex items-center justify-between px-6">
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
