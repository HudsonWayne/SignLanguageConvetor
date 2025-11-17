import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Dynamically import pdf-parse (CJS) inside the function
  const pdfParser = (await import("pdf-parse")).default || (await import("pdf-parse"));

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
  } else if (ext === "txt") {
    text = buffer.toString("utf-8");
  } else if (ext === "docx") {
    // Simple fallback: read as UTF-8 text
    text = buffer.toString("utf-8");
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
}

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
