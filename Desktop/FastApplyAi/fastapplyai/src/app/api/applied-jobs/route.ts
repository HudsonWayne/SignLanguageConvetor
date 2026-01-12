import { NextResponse } from "next/server";

let appliedJobs: any[] = [];

export async function GET() {
  return NextResponse.json(appliedJobs);
}

export async function POST(req: Request) {
  const job = await req.json();
  appliedJobs.push(job);
  return NextResponse.json({ success: true });
}
