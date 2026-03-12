import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
  source: string;
  match?: number;
}

/* ================= KEYWORD EXTRACTION ================= */
function extractKeywords(cvText: string): string[] {
  const stopWords = new Set([
    "the","and","a","to","in","of","for","with","on","at","from","by",
    "an","be","this","that","it","is","are","was","as","or","if",
    "cv","resume","experience","work","skills","education","personal"
  ]);

  const words = cvText
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const frequency: Record<string, number> = {};

  for (const w of words) {
    frequency[w] = (frequency[w] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

/* ================= MATCH SCORE ================= */
function matchScore(text: string, keywords: string[]): number {
  if (!keywords.length) return 50;

  let score = 0;
  const lower = text.toLowerCase();

  for (const k of keywords) {
    if (lower.includes(k)) score++;
  }

  return Math.round((score / keywords.length) * 100);
}

/* ================= SCRAPER ================= */
async function scrapeVacancyMail(): Promise<Job[]> {
  const jobs: Job[] = [];

  try {
    const res = await fetch("https://vacancymail.co.zw/jobs/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    $(".row.job-item").each((_, el) => {
      const title = $(el).find("h3 a").text().trim();
      const link = $(el).find("h3 a").attr("href") || "";
      const location = $(el).find(".job-location").text().trim();

      jobs.push({
        title: title || "Job Opportunity",
        company: "Zimbabwe Employer",
        location: location || "Zimbabwe",
        description: title,
        link: link.startsWith("http")
          ? link
          : `https://vacancymail.co.zw${link}`,
        source: "VacancyMail",
      });
    });
  } catch (err) {
    console.error("VacancyMail scrape error:", err);
  }

  return jobs;
}

/* ================= API ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cvText: string = body.cvText || "";

    /* Extract keywords automatically from CV */
    const keywords = extractKeywords(cvText);

    let jobs = await scrapeVacancyMail();

    jobs = jobs.map((job) => ({
      ...job,
      match: matchScore(job.title + " " + job.description, keywords),
    }));

    jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

    return NextResponse.json(jobs.slice(0, 30));
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json([]);
  }
}