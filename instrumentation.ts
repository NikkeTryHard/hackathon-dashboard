export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { tunnelManager } = await import("./lib/tunnel-manager");
    tunnelManager.start();

    process.on("SIGTERM", () => {
      tunnelManager.stop();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      tunnelManager.stop();
      process.exit(0);
    });
  }
}
