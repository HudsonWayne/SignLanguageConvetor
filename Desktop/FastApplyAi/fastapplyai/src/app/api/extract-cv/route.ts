import { NextResponse } from "next/server";
import pdfParser from "pdf-parse";
import { promises as fs } from "fs";
import path from "path";
import * as DocxParser from "docx"; // using docx to read .docx

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file: File = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  const ext = file.name.split(".").pop()?.toLowerCase();

  // PDF extraction
  if (ext === "pdf") {
    const data = await pdfParser(buffer);
    text = data.text;
  }
  // DOCX extraction
  else if (ext === "docx") {
    const tempPath = path.join("/tmp", file.name);
    await fs.writeFile(tempPath, buffer);

    const doc = await DocxParser.Packer.toBuffer({ path: tempPath });
    // Alternative using simple parsing
    // You can also use 'docx4js' or 'mammoth' for better text extraction
    text = buffer.toString("utf-8"); 
  }
  // TXT extraction
  else if (ext === "txt") {
    text = buffer.toString("utf-8");
  }

  const extracted = {
    name: extractName(text),
    email: extractEmail(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };

  return NextResponse.json(extracted);
}

// ------------------ Extraction Helpers ------------------

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

  return skills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
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
