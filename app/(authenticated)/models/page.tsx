"use client";

import { Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/ModelCard";
import { providerConfig, ProviderType } from "@/lib/provider-config";

// Static list of available models
const AVAILABLE_MODELS = [
  // Claude
  { id: "claude-sonnet-4-5", object: "model", owned_by: "antigravity" },
  { id: "claude-sonnet-4-5-thinking", object: "model", owned_by: "antigravity" },
  { id: "claude-opus-4-5-thinking", object: "model", owned_by: "antigravity" },
  // Gemini
  { id: "gemini-3-flash", object: "model", owned_by: "antigravity" },
  { id: "gemini-3-pro-high", object: "model", owned_by: "antigravity" },
  { id: "gemini-3-pro-low", object: "model", owned_by: "antigravity" },
  { id: "gemini-3-pro-image", object: "model", owned_by: "antigravity" },
  { id: "gemini-2.5-flash", object: "model", owned_by: "antigravity" },
  { id: "gemini-2.5-flash-lite", object: "model", owned_by: "antigravity" },
  { id: "gemini-2.5-flash-thinking", object: "model", owned_by: "antigravity" },
];

interface Model {
  id: string;
  object: string;
  owned_by: string;
}

function getProvider(modelId: string): ProviderType {
  if (modelId.startsWith("claude")) return "claude";
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt") || modelId.startsWith("o1") || modelId.startsWith("o3") || modelId.startsWith("o4")) return "gpt";
  return "other";
}

export default function ModelsPage() {
  const models: Model[] = AVAILABLE_MODELS;

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
      </motion.div>

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
                {providerModels.map((model, i) => (
                  <ModelCard key={model.id} id={model.id} provider={provider} index={i} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
