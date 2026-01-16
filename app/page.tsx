"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is logged in, go to dashboard
        router.replace("/dashboard");
      } else {
        // Not logged in, go to login
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}
