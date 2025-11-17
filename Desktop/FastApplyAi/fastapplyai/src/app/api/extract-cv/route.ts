import { NextResponse } from "next/server";
import pdfParser from "pdf-parse";
import { readFileSync } from "fs";
import { promises as fs } from "fs";
import path from "path";
import * as docx from "docx";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file: File | null = formData.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  const fileType = file.name.split(".").pop();

  // --- PDF ---
  if (fileType === "pdf") {
    const data = await pdfParser(buffer);
    text = data.text;
  }

  // --- DOCX ---
  else if (fileType === "docx") {
    const tempPath = path.join("/tmp", file.name);
    await fs.writeFile(tempPath, buffer);
    const doc = await docx.Packer.toText(tempPath);
    text = doc;
  }

  // --- TXT ---
  else if (fileType === "txt") {
    text = buffer.toString("utf-8");
  }

  // Simple AI-like extraction (mock)
  const extracted = {
    name: extractName(text),
    email: extractEmail(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };

  return NextResponse.json(extracted, { status: 200 });
}

// --- Extract Name ---
function extractName(text: string) {
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+(\s[A-Z][a-z]+)?)/);
  return nameMatch ? nameMatch[0] : "Not found";
}

// --- Extract Email ---
function extractEmail(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}/);
  return emailMatch ? emailMatch[0] : "Not found";
}

// --- Extract Skills ---
function extractSkills(text: string) {
  const skillKeywords = [
    "HTML","CSS","JavaScript","React","Next.js","Node.js","Python","Django","Java",
    "SQL","PHP","Laravel","WordPress","CyberSecurity","UI/UX","Algorithms",
    "Data Structures","Digital marketing","Twillio","TWILIO"
  ];

  return skillKeywords.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

// --- Extract Experience ---
function extractExperience(text: string) {
  const lines = text.split("\n").filter(line =>
    line.toLowerCase().includes("experience") ||
    line.toLowerCase().includes("worked") ||
    line.toLowerCase().includes("developer") ||
    line.toLowerCase().includes("intern")
  );

  return lines.length ? lines.join(" ") : "No experience found";
}

// --- Extract Education ---
function extractEducation(text: string) {
  const lines = text.split("\n").filter(line =>
    line.toLowerCase().includes("certificate") ||
    line.toLowerCase().includes("degree") ||
    line.toLowerCase().includes("college") ||
    line.toLowerCase().includes("university")
  );

  return lines.length ? lines.join(" ") : "No education found";
}
