import { NextResponse } from "next/server";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse"); // <-- Use this for PDFs!

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase();
    let text = "";

    if (ext === "pdf") {
      const data = await pdfParse(buffer);
      text = data.text; // pdf-parse extracts text for you
    } else if (ext === "txt") {
      text = buffer.toString("utf-8");
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const extracted = {
      name: extractName(text),
      email: extractEmail(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
    };

    return NextResponse.json(extracted);
  } catch (err: any) {
    console.error("❌ ERROR in /api/extract-cv:", err);
    return NextResponse.json({ error: "Failed to extract CV", details: err.message }, { status: 500 });
  }
}

// -------------------------
// Extraction Helpers
// -------------------------
function extractName(text: string) {
  const match = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
  return match ? match[0] : "Not Found";
}

function extractEmail(text: string) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "Not Found";
}

function extractSkills(text: string) {
  const skills = [
    "HTML","CSS","JavaScript","React","Next.js","Node.js","Python",
    "Django","Java","SQL","MongoDB","Tailwind","Bootstrap","Git",
    "UI/UX","Figma","PHP","Laravel","TypeScript","C#","C++"
  ];
  return skills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

function extractExperience(text: string) {
  const lines = text.split("\n").filter(line =>
    line.toLowerCase().includes("experience") ||
    line.toLowerCase().includes("developer") ||
    line.toLowerCase().includes("intern") ||
    line.toLowerCase().includes("work")
  );
  return lines.join(" ").slice(0, 500) || "No experience found";
}

function extractEducation(text: string) {
  const lines = text.split("\n").filter(line =>
    line.toLowerCase().includes("degree") ||
    line.toLowerCase().includes("college") ||
    line.toLowerCase().includes("university") ||
    line.toLowerCase().includes("diploma") ||
    line.toLowerCase().includes("certificate")
  );
  return lines.join(" ").slice(0, 500) || "No education found";
}
