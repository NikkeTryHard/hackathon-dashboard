"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, Check } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface SettingsSectionProps {
  settings: Record<string, string>;
  onSave: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_PORT = "8083";

export function SettingsSection({ settings, onSave, isLoading }: SettingsSectionProps) {
  const [port, setPort] = useState(settings.antigravity_port || DEFAULT_PORT);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when settings prop changes
  useEffect(() => {
    setPort(settings.antigravity_port || DEFAULT_PORT);
  }, [settings.antigravity_port]);

  const hasChanges = port !== (settings.antigravity_port || DEFAULT_PORT);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    // Validate port number
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError("Please enter a valid port number (1-65535)");
      return;
    }

    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSave("antigravity_port", port);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [port, hasChanges, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && hasChanges && !isSaving) {
        handleSave();
      }
    },
    [hasChanges, isSaving, handleSave],
  );

  return (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition} className="surface-elevated p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gold/10">
          <Settings className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          <p className="text-sm text-text-tertiary">Configure system-wide settings</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Antigravity Port Setting */}
        <div>
          <label htmlFor="antigravity-port" className="block text-xs font-medium text-text-tertiary uppercase tracking-widest mb-2">
            Antigravity Port
          </label>

          {isLoading ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-0 border border-border-dim">
              <Loader2 className="w-4 h-4 animate-spin text-text-ghost" />
              <span className="text-text-ghost">Loading settings...</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <span className="text-text-secondary">http://127.0.0.1:</span>
              <input
                id="antigravity-port"
                type="number"
                min="1"
                max="65535"
                value={port}
                onChange={(e) => {
                  setPort(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="8083"
                className="input-field w-24"
              />
              <button onClick={handleSave} disabled={!hasChanges || isSaving} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${saveSuccess ? "bg-success text-void" : hasChanges ? "btn-primary" : "bg-surface-1 text-text-ghost cursor-not-allowed"}`}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? "Saved" : "Save"}</span>
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-sm text-error">{error}</p>}

          <p className="mt-2 text-xs text-text-ghost">The port number for the local Antigravity API endpoint.</p>
        </div>
      </div>
    </motion.div>
  );
}
