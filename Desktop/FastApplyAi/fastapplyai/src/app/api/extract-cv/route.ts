import { NextResponse } from "next/server";
import { createRequire } from "module";
import { Document, Packer } from "docx";
import * as docx from "docx";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const require = createRequire(import.meta.url);
  const pdfParser = require("pdf-parse");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop()?.toLowerCase();

    let text = "";

    // -------------------------
    // 📌 PDF PARSING
    // -------------------------
    if (ext === "pdf") {
      const data = await pdfParser(buffer);
      text = data.text;
    }

    // -------------------------
    // 📌 TXT PARSING
    // -------------------------
    else if (ext === "txt") {
      text = buffer.toString("utf-8");
    }

    // -------------------------
    // 📌 DOCX PARSING (REAL FIX)
    // -------------------------
    else if (ext === "docx") {
      const doc = await docx.Packer.unpack(buffer);
      text = doc._children
        .map((block: any) => block._text || "")
        .join("\n");
    } 
    
    else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // -------------------------
    // 📌 EXTRACTION
    // -------------------------
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
    return NextResponse.json(
      { error: "Failed to extract CV", details: err.message },
      { status: 500 }
    );
  }
}

// -------------------------
// 📌 HELPERS
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
    "HTML", "CSS", "JavaScript", "React", "Next.js", "Node.js", "Python",
    "Django", "Java", "SQL", "MongoDB", "Tailwind", "Bootstrap", "Git",
    "UI/UX", "Figma", "PHP", "Laravel", "TypeScript", "C#", "C++"
  ];
  return skills.filter(s => text.toLowerCase().includes(s.toLowerCase()));
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
