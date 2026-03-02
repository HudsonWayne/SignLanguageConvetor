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

/* ================= MATCH SCORE ================= */
function matchScore(text: string, keywords: string[]): number {
  if (!keywords || keywords.length === 0) return 50;

  let score = 0;
  const lower = text.toLowerCase();

  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) score++;
  }

  return Math.round((score / keywords.length) * 100);
}

/* ================= SCRAPE VacancyMail ================= */
async function scrapeVacancyMail(): Promise<Job[]> {
  const jobs: Job[] = [];

  try {
    const res = await fetch("https://vacancymail.co.zw/jobs/", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    $(".job-listing").each((_, el) => {
      const title = $(el).find("h3").text().trim();
      const link = $(el).attr("href") || "";

      jobs.push({
        title: title || "Job Opportunity",
        company: "Zimbabwe Employer",
        location: "Zimbabwe",
        description: "Click apply to view full job details.",
        link,
        source: "VacancyMail",
      });
    });

    console.log("Scraped jobs:", jobs.length);
  } catch (err) {
    console.error("Scraping error:", err);
  }

  return jobs;
}

/* ================= API ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keywords: string[] = body.keywords || [];

    let jobs = await scrapeVacancyMail();

    jobs = jobs.map((job) => ({
      ...job,
      match: matchScore(job.title + job.description, keywords),
    }));

    jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

    return NextResponse.json(jobs.slice(0, 30));
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json([]);
  }
}