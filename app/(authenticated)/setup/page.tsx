"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/CodeBlock";
import { SetupStep } from "@/components/SetupStep";
import { TunnelStatus } from "@/components/TunnelStatus";

export default function SetupPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10 border border-info/20">
            <BookOpen className="w-5 h-5 text-info" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">setup</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Get Claude Code connected to our hackathon endpoints in 2 minutes.</p>
      </motion.div>

      <TunnelStatus />

      <div className="surface-elevated p-5">
        <h3 className="font-semibold text-text-primary mb-4">API Paths (append to tunnel URL above)</h3>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center p-3 bg-surface-0 rounded-lg border border-border-dim">
            <span className="text-text-tertiary">OpenAI Compatible:</span>
            <code className="text-gold">/v1</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-surface-0 rounded-lg border border-border-dim">
            <span className="text-text-tertiary">Anthropic:</span>
            <code className="text-gold">/v1/messages</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-surface-0 rounded-lg border border-border-dim">
            <span className="text-text-tertiary">Gemini:</span>
            <code className="text-gold">/v1beta/models</code>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SetupStep number={1} title="Install Claude Code" description="If you haven't already, install Claude Code CLI.">
          <CodeBlock code="npm install -g @anthropic-ai/claude-code" language="bash" />
          <p className="text-xs text-text-ghost mt-3">
            Or use the{" "}
            <a href="https://docs.anthropic.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-info hover:text-info/80 transition-colors inline-flex items-center gap-1">
              VS Code extension <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </SetupStep>

        <SetupStep number={2} title="Configure API Key" description="Set your hackathon API key (the one you used to login here).">
          <CodeBlock
            code={`# Set your API key
export ANTHROPIC_API_KEY="your-hackathon-api-key"

# Or add to your shell config (~/.bashrc, ~/.zshrc)
echo 'export ANTHROPIC_API_KEY="your-hackathon-api-key"' >> ~/.zshrc`}
            language="bash"
          />
        </SetupStep>

        <SetupStep number={3} title="Configure Endpoints" description="Point Claude Code to our hackathon proxy.">
          <p className="text-sm text-text-tertiary mb-3">
            Copy the tunnel URL from above and add it to <code className="text-info font-mono">~/.claude/settings.json</code>:
          </p>
          <CodeBlock
            code={`{
  "apiBaseUrl": "<paste-tunnel-url-from-above>",
  "model": "claude-sonnet-4-5"
}`}
            language="json"
            filename="~/.claude/settings.json"
          />
          <p className="text-xs text-warning mt-3">Note: The tunnel URL changes when the server restarts. Check this page for the latest URL.</p>
        </SetupStep>

        <SetupStep number={4} title="Verify Connection" description="Make sure everything is working.">
          <CodeBlock
            code={`# Start Claude Code
claude

# Or run a quick test
claude "Say hello if you can hear me"`}
            language="bash"
          />
          <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-sm text-success">If you see a response, you&apos;re connected! Your usage will show up on the dashboard.</p>
          </div>
        </SetupStep>

        <SetupStep number={5} title="Choose Your Model" description="Pick the best model for your task.">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-4 p-4 rounded-lg surface-base">
              <span className="text-gold font-mono whitespace-nowrap">claude-sonnet-4-5</span>
              <span className="text-text-tertiary">Best balance of speed + quality. Recommended for most coding.</span>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg surface-base">
              <span className="text-info font-mono whitespace-nowrap">claude-opus-4</span>
              <span className="text-text-tertiary">Most powerful. Use for complex architecture decisions.</span>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg surface-base">
              <span className="text-success font-mono whitespace-nowrap">gemini-2.5-pro</span>
              <span className="text-text-tertiary">Great for long context. Good alternative.</span>
            </div>
          </div>
          <p className="text-xs text-text-ghost mt-4">
            See all available models on the{" "}
            <a href="/models" className="text-info hover:text-info/80 transition-colors">
              Models page
            </a>
          </p>
        </SetupStep>
      </div>

      <div className="surface-elevated p-5">
        <h3 className="font-semibold text-text-primary mb-2">Need help?</h3>
        <p className="text-sm text-text-tertiary">
          Ping <span className="text-info">@Louis</span> in Discord or check if the endpoint is up on the dashboard.
        </p>
      </div>
    </div>
  );
}
