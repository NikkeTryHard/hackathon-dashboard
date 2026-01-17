"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, Check, ExternalLink } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface SettingsSectionProps {
  settings: Record<string, string>;
  onSave: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
}

export function SettingsSection({ settings, onSave, isLoading }: SettingsSectionProps) {
  const [antigravityUrl, setAntigravityUrl] = useState(settings.antigravity_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when settings prop changes
  useEffect(() => {
    setAntigravityUrl(settings.antigravity_url || "");
  }, [settings.antigravity_url]);

  const hasChanges = antigravityUrl !== (settings.antigravity_url || "");

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    // Basic URL validation
    try {
      new URL(antigravityUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSave("antigravity_url", antigravityUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [antigravityUrl, hasChanges, onSave]);

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
        {/* Antigravity URL Setting */}
        <div>
          <label htmlFor="antigravity-url" className="flex items-center gap-2 text-xs font-medium text-text-tertiary uppercase tracking-widest mb-2">
            Antigravity Endpoint URL
            <a href={antigravityUrl || "#"} target="_blank" rel="noopener noreferrer" className={`p-1 rounded hover:bg-surface-1 transition-colors ${!antigravityUrl ? "opacity-50 pointer-events-none" : ""}`} title="Open URL in new tab">
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          {isLoading ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-0 border border-border-dim">
              <Loader2 className="w-4 h-4 animate-spin text-text-ghost" />
              <span className="text-text-ghost">Loading settings...</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                id="antigravity-url"
                type="url"
                value={antigravityUrl}
                onChange={(e) => {
                  setAntigravityUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://api.antigravity.example.com"
                className="input-field flex-1"
              />
              <button onClick={handleSave} disabled={!hasChanges || isSaving} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${saveSuccess ? "bg-success text-void" : hasChanges ? "btn-primary" : "bg-surface-1 text-text-ghost cursor-not-allowed"}`}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? "Saved" : "Save"}</span>
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-sm text-error">{error}</p>}

          <p className="mt-2 text-xs text-text-ghost">The base URL for the Antigravity API endpoint. This URL will be used for all proxy requests.</p>
        </div>
      </div>
    </motion.div>
  );
}
