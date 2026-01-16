import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

class TunnelManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private currentUrl: string | null = null;
  private isRunning: boolean = false;
  private restartAttempts: number = 0;
  private maxRestartAttempts: number = 5;

  constructor() {
    super();
  }

  getUrl(): string | null {
    return this.currentUrl;
  }

  getStatus(): { running: boolean; url: string | null } {
    return { running: this.isRunning, url: this.currentUrl };
  }

  start(): void {
    if (this.process) {
      console.log("[Tunnel] Already running");
      return;
    }

    console.log("[Tunnel] Starting cloudflared...");
    this.isRunning = false;
    this.currentUrl = null;

    this.process = spawn("cloudflared", ["tunnel", "--url", "http://localhost:8083"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const parseUrl = (data: Buffer) => {
      const output = data.toString();
      const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (urlMatch && !this.currentUrl) {
        this.currentUrl = urlMatch[0];
        this.isRunning = true;
        this.restartAttempts = 0;
        console.log(`[Tunnel] Connected: ${this.currentUrl}`);
        this.emit("connected", this.currentUrl);
      }
    };

    this.process.stdout?.on("data", parseUrl);
    this.process.stderr?.on("data", parseUrl);

    this.process.on("close", (code) => {
      console.log(`[Tunnel] Process exited with code ${code}`);
      this.process = null;
      this.isRunning = false;
      const oldUrl = this.currentUrl;
      this.currentUrl = null;
      this.emit("disconnected", oldUrl);

      if (this.restartAttempts < this.maxRestartAttempts) {
        this.restartAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.restartAttempts), 30000);
        console.log(`[Tunnel] Restarting in ${delay}ms (attempt ${this.restartAttempts})`);
        setTimeout(() => this.start(), delay);
      } else {
        console.error("[Tunnel] Max restart attempts reached");
        this.emit("error", new Error("Max restart attempts reached"));
      }
    });

    this.process.on("error", (err) => {
      console.error("[Tunnel] Failed to start:", err.message);
      this.emit("error", err);
    });
  }

  stop(): void {
    if (this.process) {
      console.log("[Tunnel] Stopping...");
      this.process.kill("SIGTERM");
      this.process = null;
      this.isRunning = false;
      this.currentUrl = null;
    }
  }

  restart(): void {
    this.restartAttempts = 0;
    this.stop();
    setTimeout(() => this.start(), 1000);
  }
}

export const tunnelManager = new TunnelManager();
