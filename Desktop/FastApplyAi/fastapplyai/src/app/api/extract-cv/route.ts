// src/app/api/extract-cv/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { createRequire } from "module";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Schema
const CVSchema = new mongoose.Schema({
  filename: String,
  uploadedAt: Date,
  ext: String,
  extracted: Object,
}, { collection: "cv_submissions" });

const CVModel = mongoose.models.CV || mongoose.model("CV", CVSchema);

// POST Handler
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let text = "";

    if (ext === "pdf") {
      const data = await pdfParse(buffer);
      text = data?.text || "";
      if (!text.trim()) throw new Error("No text extracted from PDF");
    } else if (ext === "txt") {
      text = buffer.toString("utf-8");
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const extracted = {
      name: extractName(text),
      email: extractEmail(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      rawText: text.slice(0, 10000),
    };

    await connectDB();
    const doc = new CVModel({ filename: file.name, uploadedAt: new Date(), ext, extracted });
    const result = await doc.save();

    return NextResponse.json({ ok: true, insertedId: result._id.toString(), extracted });
  } catch (err: any) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// --- Helper functions ---
function extractName(text: string) {
  const match = text.match(/\b([A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20})\b/);
  return match ? match[1].trim() : "Not Found";
}

function extractEmail(text: string) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "Not Found";
}

function extractSkills(text: string) {
  const skills = ["html","css","javascript","react","next.js","node.js","python","django","java","sql","mongodb","tailwind","bootstrap","git","figma","php","laravel","typescript","c#","c++","docker","kubernetes","aws","azure","gcp","rest","graphql"];
  const lower = text.toLowerCase();
  const found = Array.from(new Set(skills.filter(s => lower.includes(s))));
  return found.length ? found : ["No skills found"];
}

function extractExperience(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const hits = lines.filter(line => /experience|worked|employed|responsible for|years|month|intern|developer|engineer|consultant/i.test(line));
  return hits.slice(0, 10).join(" ") || null;
}

function extractEducation(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const hits = lines.filter(line => /degree|university|college|bachelor|master|bs|ba|msc|phd|diploma|certificate/i.test(line));
  return hits.slice(0, 6).join(" ") || null;
}
