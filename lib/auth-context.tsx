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
    // Use a microtask to avoid synchronous setState in effect body
    // This satisfies the react-hooks/set-state-in-effect rule
    queueMicrotask(() => {
      const stored = localStorage.getItem("hackathon-user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) return false;

      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("hackathon-user", JSON.stringify(userData));
      localStorage.setItem("hackathon-raw-key", apiKey);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hackathon-user");
    localStorage.removeItem("hackathon-raw-key");
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
