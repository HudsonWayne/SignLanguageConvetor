import { NextResponse } from "next/server";
// Use require for CJS modules
const pdfParser = require("pdf-parse");

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    const data = await pdfParser(buffer);
    text = data.text;
  } else {
    text = buffer.toString("utf-8");
  }

  const extracted = {
    name: text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/)?.[0] || "Not Found",
    email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "Not Found",
    skills: ["JavaScript", "React", "Node.js"].filter(s =>
      text.toLowerCase().includes(s.toLowerCase())
    ),
    experience: text.slice(0, 500),
    education: text.slice(0, 500),
  };

  return NextResponse.json(extracted);
}
