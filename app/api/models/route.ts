import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

const DEFAULT_ANTIGRAVITY_PORT = "8083";

// GET /api/models - Proxy to Antigravity /v1/models endpoint
export async function GET() {
  try {
    const port = await getSetting("antigravity_port", DEFAULT_ANTIGRAVITY_PORT);

    const modelsUrl = `http://127.0.0.1:${port}/v1/models`;

    const response = await fetch(modelsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Set a reasonable timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Antigravity models endpoint returned ${response.status}: ${response.statusText}`);
      return NextResponse.json(
        {
          error: "Failed to fetch models from Antigravity",
          status: response.status,
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        console.error("Antigravity request timed out");
        return NextResponse.json({ error: "Antigravity service timed out" }, { status: 504 });
      }

      if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
        console.error("Antigravity service unavailable:", error.message);
        return NextResponse.json({ error: "Antigravity service is unavailable" }, { status: 503 });
      }
    }

    console.error("Models proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
