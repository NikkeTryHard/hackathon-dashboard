"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, AlertCircle, ArrowRight, Shield } from "lucide-react";
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-void">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse at top, rgba(212, 168, 83, 0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Login card */}
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="relative z-10 w-full max-w-[400px] mx-4">
        <div className="surface-elevated p-8">
          {/* Header */}
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-6">{isAdminMode ? <Shield className="w-6 h-6 text-error" /> : <Key className="w-6 h-6 text-gold" />}</div>

            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {isAdminMode ? (
                <span className="text-error">Admin Access</span>
              ) : (
                <>
                  <span className="text-gold">hackathon</span>
                  <span className="text-text-ghost mx-1.5">/</span>
                  <span className="text-text-primary">crew</span>
                </>
              )}
            </h1>
            <p className="text-sm text-text-tertiary">{isAdminMode ? "Enter admin credentials" : "Enter your API key to continue"}</p>
          </motion.div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-text-tertiary uppercase tracking-widest">{isAdminMode ? "Admin Key" : "API Key"}</label>
              <div className="relative">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={isAdminMode ? "sk-admin-..." : "sk-ant-..."} className="input-field pl-11" autoComplete="off" spellCheck={false} autoFocus />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-ghost" />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 text-sm bg-error/10 border border-error/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <span className="text-error/90">{error}</span>
              </motion.div>
            )}

            <button type="submit" disabled={isLoading || !apiKey} className="btn-primary w-full">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div className="mt-8 pt-6 border-t border-border-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-ghost">
                Need access? <span className="text-gold/80 hover:text-gold cursor-pointer transition-colors">Ask Louis</span>
              </p>
              <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} className="btn-ghost text-xs py-1.5 px-3">
                <Shield className="w-3 h-3" />
                <span>{isAdminMode ? "User" : "Admin"}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Version */}
        <motion.div className="text-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <span className="text-[11px] text-text-ghost font-mono tracking-wide">v1.0.0</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
