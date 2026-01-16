import { Brain, Sparkles, Zap, Cpu, LucideIcon } from "lucide-react";

export interface ProviderConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  iconColor: string;
}

export const providerConfig: Record<"claude" | "gemini" | "gpt" | "other", ProviderConfig> = {
  claude: {
    label: "Anthropic Claude",
    icon: Brain,
    color: "text-info",
    bgColor: "bg-info/5",
    borderColor: "border-info/15",
    hoverBorder: "hover:border-info/30",
    iconColor: "text-info",
  },
  gemini: {
    label: "Google Gemini",
    icon: Sparkles,
    color: "text-gold",
    bgColor: "bg-gold/5",
    borderColor: "border-gold/15",
    hoverBorder: "hover:border-gold/30",
    iconColor: "text-gold",
  },
  gpt: {
    label: "OpenAI GPT",
    icon: Zap,
    color: "text-success",
    bgColor: "bg-success/5",
    borderColor: "border-success/15",
    hoverBorder: "hover:border-success/30",
    iconColor: "text-success",
  },
  other: {
    label: "Other",
    icon: Cpu,
    color: "text-text-ghost",
    bgColor: "bg-surface-1",
    borderColor: "border-border-dim",
    hoverBorder: "hover:border-border",
    iconColor: "text-text-ghost",
  },
};

export type ProviderType = keyof typeof providerConfig;
