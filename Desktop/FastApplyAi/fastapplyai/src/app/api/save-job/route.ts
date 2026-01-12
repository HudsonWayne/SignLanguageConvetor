import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const saved = {
    ...body,
    status: "Saved",
    savedAt: new Date().toISOString(),
  };

  return NextResponse.json(saved);
}
