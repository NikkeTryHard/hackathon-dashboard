"use client";

import { useEffect, useState } from "react";
import { Cpu, RefreshCw, Brain, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/ModelCard";

interface Model {
  id: string;
  object: string;
  owned_by: string;
}

function getProvider(modelId: string): "claude" | "gemini" | "gpt" | "other" {
  if (modelId.startsWith("claude")) return "claude";
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt") || modelId.startsWith("o1") || modelId.startsWith("o3")) return "gpt";
  return "other";
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8083/v1/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(data.data || []);
    } catch {
      setError("Could not fetch models. Is the endpoint running?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const grouped = models.reduce(
    (acc, model) => {
      const provider = getProvider(model.id);
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );

  const providerInfo = {
    claude: { label: "Anthropic Claude", icon: Brain, color: "text-neon-purple" },
    gemini: { label: "Google Gemini", icon: Sparkles, color: "text-neon-cyan" },
    gpt: { label: "OpenAI GPT", icon: Zap, color: "text-neon-green" },
    other: { label: "Other", icon: Cpu, color: "text-gray-400" },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-neon-purple" />
            <h1 className="text-2xl font-bold">
              <span className="text-gray-500">~/</span>
              <span className="neon-green">models</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">{models.length} models available via Antigravity Manager</p>
        </div>

        <button onClick={fetchModels} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-card border border-dark-border hover:border-neon-green/30 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </motion.div>

      {error && (
        <div className="card p-4 border border-red-500/30 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          {(["claude", "gemini", "gpt", "other"] as const).map((provider) => {
            const providerModels = grouped[provider] || [];
            if (providerModels.length === 0) return null;

            const info = providerInfo[provider];
            const Icon = info.icon;

            return (
              <motion.div key={provider} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                  <h2 className="text-lg font-bold">{info.label}</h2>
                  <span className="text-sm text-gray-500">({providerModels.length})</span>
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
