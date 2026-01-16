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
                Don&apos;t have a key? <span className="text-neon-purple">Ask Louis</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
