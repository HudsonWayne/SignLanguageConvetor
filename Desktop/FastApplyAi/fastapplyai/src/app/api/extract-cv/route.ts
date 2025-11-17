import { NextResponse } from "next/server";
import pdfParser from "pdf-parse";

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

  // Parse PDFs
  if (ext === "pdf") {
    const data = await pdfParser(buffer);
    text = data.text;
  }
  // Plain text
  else if (ext === "txt") {
    text = buffer.toString("utf-8");
  }
  // DOCX fallback: read as UTF-8 text (basic)
  else if (ext === "docx") {
    text = buffer.toString("utf-8");
  }

  // Normalize text
  text = text.replace(/\r/g, "\n");

  // Extracted fields
  const extracted = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };

  return NextResponse.json(extracted);
}

// ---- Extractors ----

function extractName(text: string) {
  // Look for lines with 2-3 words, each capitalized
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const words = line.split(" ");
    if (words.length >= 2 && words.length <= 3) {
      if (words.every(w => /^[A-Z][a-z]/.test(w))) {
        return line;
      }
    }
  }
  return "Not Found";
}

function extractEmail(text: string) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "Not Found";
}

function extractPhone(text: string) {
  const match = text.match(/(\+?\d{1,4}[\s-])?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/);
  return match ? match[0] : "Not Found";
}

function extractSkills(text: string) {
  // Take capitalized words or known keywords
  const knownSkills = ["HTML","CSS","JavaScript","React","Next.js","Node.js","Python","Java","SQL","MongoDB","Git","Figma","TypeScript","C#","C++"];
  const skills: string[] = [];

  knownSkills.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) skills.push(skill);
  });

  // Also pick any capitalized words that may be skills (basic heuristic)
  const caps = Array.from(new Set(text.match(/\b[A-Z][a-zA-Z]+\b/g) || []));
  caps.forEach(word => {
    if (!skills.includes(word)) skills.push(word);
  });

  return skills.slice(0, 50); // limit for readability
}

function extractExperience(text: string) {
  const lines = text.split("\n").filter(line =>
    /(experience|developer|engineer|intern|manager|consultant|lead|worked|work)/i.test(line)
  );
  return lines.join(" ").slice(0, 500) || "Not Found";
}

function extractEducation(text: string) {
  const lines = text.split("\n").filter(line =>
    /(degree|bachelor|master|college|university|diploma|certificate|phd)/i.test(line)
  );
  return lines.join(" ").slice(0, 500) || "Not Found";
}
