import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { IncomingForm } from "formidable";

export const runtime = "nodejs";

// Disable Next.js body parser to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req as any, async (err, fields, files: any) => {
      if (err) {
        resolve(NextResponse.json({ error: "Failed to parse form" }, { status: 500 }));
        return;
      }

      try {
        const file = files.file;
        if (!file) {
          resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
          return;
        }

        const data = fs.readFileSync(file.filepath);

        // Parse PDF text (you can add DOCX/TXT parsing here)
        const pdfData = await pdfParse(data);

        resolve(NextResponse.json({ text: pdfData.text }));
      } catch (e) {
        console.error(e);
        resolve(NextResponse.json({ error: "Failed to process file" }, { status: 500 }));
      }
    });
  });
}
