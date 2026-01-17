"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/api-utils";

interface User {
  id: string;
  name: string;
  apiKey: string; // This is now just the masked prefix
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
    // Check for existing session via sessionStorage instead of localStorage
    // The session cookie will be sent automatically
    const checkSession = async () => {
      try {
        const stored = sessionStorage.getItem("hackathon-user");
        if (stored) {
          setUser(safeJsonParse<User | null>(stored, null));
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
        credentials: "include", // Include cookies
      });

      if (!res.ok) return false;

      const userData = await res.json();
      setUser(userData);

      // Store in sessionStorage (clears on browser close) instead of localStorage
      // Don't store the raw API key at all
      sessionStorage.setItem("hackathon-user", JSON.stringify(userData));

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("hackathon-user");
    // Clear the session cookie by calling logout endpoint
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
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
