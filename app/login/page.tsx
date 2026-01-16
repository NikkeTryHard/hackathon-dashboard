"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Key, AlertCircle, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(apiKey);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid API key. Check your key and try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-bg relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Radial gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-green/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
              opacity: 0,
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main login card */}
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="relative z-10 w-full max-w-md mx-4">
        {/* Terminal window */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-green/20 via-neon-purple/20 to-neon-cyan/20 rounded-xl blur-xl opacity-50" />

          <div className="relative bg-dark-card border border-dark-border/50 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Window chrome */}
            <div className="bg-dark-bg/80 border-b border-dark-border px-4 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-500 font-mono">{isAdminMode ? "admin@hackathon" : "hackathon-auth"} — zsh</span>
              </div>
              <div className="w-16" /> {/* Spacer for symmetry */}
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30 mb-4">{isAdminMode ? <Shield className="w-8 h-8 text-neon-purple" /> : <Terminal className="w-8 h-8 text-neon-green" />}</div>
                <h1 className="text-2xl font-bold mb-2">
                  {isAdminMode ? (
                    <span className="neon-purple">Admin Access</span>
                  ) : (
                    <>
                      <span className="neon-green">hackathon</span>
                      <span className="text-gray-500">@</span>
                      <span className="text-neon-purple">crew</span>
                    </>
                  )}
                </h1>
                <p className="text-sm text-gray-500">{isAdminMode ? "Enter your admin credentials" : "Enter your API key to access the terminal"}</p>
              </motion.div>

              {/* Form */}
              <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-neon-green">$</span>
                    <span>{isAdminMode ? "admin_key" : "api_key"}</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green/50 to-neon-purple/50 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    <div className="relative flex items-center">
                      <Key className="absolute left-4 w-4 h-4 text-gray-500 group-focus-within:text-neon-green transition-colors" />
                      <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={isAdminMode ? "sk-admin-..." : "sk-ant-..."} className="w-full bg-dark-bg border border-dark-border rounded-lg py-3.5 pl-11 pr-4 text-sm font-mono focus:outline-none focus:border-neon-green/50 focus:bg-dark-bg/80 transition-all placeholder:text-gray-600" autoComplete="off" spellCheck={false} />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button type="submit" disabled={isLoading || !apiKey} className="relative w-full py-3.5 rounded-lg font-mono text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-green/20 to-neon-green/10 group-hover:from-neon-green/30 group-hover:to-neon-green/20 transition-all" />
                  <div className="absolute inset-0 border border-neon-green/40 group-hover:border-neon-green/60 rounded-lg transition-colors" />
                  <span className="relative flex items-center justify-center gap-2 text-neon-green">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>$ authenticate</span>
                      </>
                    )}
                  </span>
                </button>
              </motion.form>

              {/* Footer */}
              <motion.div className="mt-8 pt-6 border-t border-dark-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Don&apos;t have a key? <span className="text-neon-purple hover:underline cursor-pointer">Ask Louis</span>
                  </p>
                  <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-purple transition-colors">
                    <Shield className="w-3 h-3" />
                    <span>{isAdminMode ? "User login" : "Admin"}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Version tag */}
        <motion.div className="text-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <span className="text-xs text-gray-600 font-mono">v1.0.0</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
