"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/CodeBlock";
import { SetupStep } from "@/components/SetupStep";
import { TunnelStatus } from "@/components/TunnelStatus";

export default function SetupPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-neon-cyan" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">setup</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Get Claude Code connected to our hackathon endpoints in 2 minutes.</p>
      </motion.div>

      <TunnelStatus />

      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold text-gray-300 mb-3">API Paths (append to tunnel URL above)</h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">OpenAI Compatible:</span>
            <code className="text-neon-green">/v1</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Anthropic:</span>
            <code className="text-neon-green">/v1/messages</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gemini:</span>
            <code className="text-neon-green">/v1beta/models</code>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SetupStep number={1} title="Install Claude Code" description="If you haven't already, install Claude Code CLI.">
          <CodeBlock code="npm install -g @anthropic-ai/claude-code" language="bash" />
          <p className="text-xs text-gray-500 mt-2">
            Or use the{" "}
            <a href="https://docs.anthropic.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:underline inline-flex items-center gap-1">
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
          <p className="text-sm text-gray-400 mb-3">
            Copy the tunnel URL from above and add it to <code className="text-neon-cyan">~/.claude/settings.json</code>:
          </p>
          <CodeBlock
            code={`{
  "apiBaseUrl": "<paste-tunnel-url-from-above>",
  "model": "claude-sonnet-4-5"
}`}
            language="json"
            filename="~/.claude/settings.json"
          />
          <p className="text-xs text-yellow-500 mt-2">Warning: The tunnel URL changes when the server restarts. Check this page for the latest URL.</p>
        </SetupStep>

        <SetupStep number={4} title="Verify Connection" description="Make sure everything is working.">
          <CodeBlock
            code={`# Start Claude Code
claude

# Or run a quick test
claude "Say hello if you can hear me"`}
            language="bash"
          />
          <div className="mt-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <p className="text-sm text-neon-green">If you see a response, you&apos;re connected! Your usage will show up on the dashboard.</p>
          </div>
        </SetupStep>

        <SetupStep number={5} title="Choose Your Model" description="Pick the best model for your task.">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-green font-mono">claude-sonnet-4-5</span>
              <span className="text-gray-400">Best balance of speed + quality. Recommended for most coding.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-purple font-mono">claude-opus-4</span>
              <span className="text-gray-400">Most powerful. Use for complex architecture decisions.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
              <span className="text-neon-cyan font-mono">gemini-2.5-pro</span>
              <span className="text-gray-400">Great for long context. Good alternative.</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            See all available models on the{" "}
            <a href="/models" className="text-neon-purple hover:underline">
              Models page
            </a>
          </p>
        </SetupStep>
      </div>

      <div className="card p-4 border border-dark-border">
        <h3 className="font-bold mb-2">Need help?</h3>
        <p className="text-sm text-gray-400">
          Ping <span className="text-neon-purple">@Louis</span> in Discord or check if the endpoint is up on the dashboard.
        </p>
      </div>
    </div>
  );
}
