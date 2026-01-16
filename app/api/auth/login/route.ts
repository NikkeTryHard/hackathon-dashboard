import { NextRequest, NextResponse } from "next/server";

const MOCK_USERS: Record<string, { id: string; name: string; isAdmin: boolean }> = {
  "sk-hackathon-louis": { id: "1", name: "Louis", isAdmin: true },
  "sk-hackathon-alice": { id: "2", name: "Alice", isAdmin: false },
  "sk-hackathon-bob": { id: "3", name: "Bob", isAdmin: false },
  "sk-hackathon-charlie": { id: "4", name: "Charlie", isAdmin: false },
};

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  const user = MOCK_USERS[apiKey];

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return NextResponse.json({
    ...user,
    apiKey: apiKey.slice(0, 12) + "...",
  });
}
