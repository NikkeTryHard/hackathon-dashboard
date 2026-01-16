"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        <span className="text-gray-500">~/</span>
        <span className="neon-green cursor-blink">dashboard</span>
      </h1>
      <p className="text-sm text-gray-500">Welcome back, {user?.name}. Dashboard content coming soon.</p>
    </div>
  );
}
