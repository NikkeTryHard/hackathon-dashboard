"use client";

import { useEffect, useState, useCallback } from "react";
import { Cpu, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/ModelCard";
import { providerConfig, ProviderType } from "@/lib/provider-config";

interface Model {
  id: string;
  object: string;
  owned_by: string;
}

function getProvider(modelId: string): ProviderType {
  if (modelId.startsWith("claude")) return "claude";
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt") || modelId.startsWith("o1") || modelId.startsWith("o3")) return "gpt";
  return "other";
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(data.data || []);
    } catch {
      setError("Could not fetch models. Is the endpoint running?");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const grouped = models.reduce(
    (acc, model) => {
      const provider = getProvider(model.id);
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10 border border-info/20">
              <Cpu className="w-5 h-5 text-info" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="text-text-ghost">~/</span>
              <span className="text-gold">models</span>
            </h1>
          </div>
          <p className="text-sm text-text-tertiary">{models.length} models available via Antigravity Manager</p>
        </div>

        <button onClick={fetchModels} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-1 border border-border hover:border-gold/30 hover:bg-surface-2 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 text-text-tertiary ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-sm text-text-secondary">Refresh</span>
        </button>
      </motion.div>

      {error && (
        <div className="surface-elevated p-4 border-error/20 bg-error/5">
          <p className="text-error">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-10">
          {(["claude", "gemini", "gpt", "other"] as const).map((provider) => {
            const providerModels = grouped[provider] || [];
            if (providerModels.length === 0) return null;

            const config = providerConfig[provider];
            const Icon = config.icon;

            return (
              <motion.div key={provider} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <h2 className="text-lg font-semibold text-text-primary">{config.label}</h2>
                  <span className="badge">{providerModels.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {providerModels
                    .filter((m) => !m.id.includes("*"))
                    .map((model, i) => (
                      <ModelCard key={model.id} id={model.id} provider={provider} index={i} />
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
