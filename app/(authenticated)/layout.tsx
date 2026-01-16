"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
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
    <>
      <Navbar />
      <Sidebar />
      <main className="ml-56 mt-14 p-6 min-h-screen">{children}</main>
    </>
  );
}
