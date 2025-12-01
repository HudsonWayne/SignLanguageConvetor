// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

// Safe fetch
async function safeFetch(url: string, opts: RequestInit = {}) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    ...((opts && opts.headers) || {}),
  };
  try {
    return await fetch(url, { ...opts, headers });
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response("", { status: 500 });
  }
}

function txt(s: any) {
  return (s || "").toString().trim().replace(/\s+/g, " ");
}

// --- Scrapers (same as before)
async function scrapeCvPeople(query: string) { /* ... same as your previous code ... */ }
async function scrapeJobsZimbabwe(query: string) { /* ... same as your previous code ... */ }
async function scrapePindula(query: string) { /* ... same as your previous code ... */ }

function computeMatchPercent(skills: string[], text: string) {
  if (!skills || skills.length === 0) return 0;
  const lower = (text || "").toLowerCase();
  let count = 0;
  for (const s of skills) if (s && lower.includes(s.toLowerCase())) count++;
  return Math.max(Math.round((count / skills.length) * 100), 10);
}

// POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills: string[] = body.skills || [];
    const country: string = body.country || "";
    const page = Number(body.page || 1);

    if (!skills.length) return NextResponse.json({ jobs: [] });

    const query = skills.slice(0, 6).join(" ");

    const [cvp, jz, pind] = await Promise.all([
      scrapeCvPeople(query),
      scrapeJobsZimbabwe(query),
      scrapePindula(query),
    ]);

    let results = [...cvp, ...jz, ...pind];

    // Deduplicate
    const seen = new Set();
    results = results.filter(job => {
      const key = `${job.title}|${job.company}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by country if provided
    if (country) {
      const cLower = country.toLowerCase();
      results = results.filter(job => {
        const loc = (job.location || "").toLowerCase();
        return loc.includes(cLower) || loc.includes("remote") || loc === "";
      });
    }

    // Compute match percent
    results = results.map(job => ({
      ...job,
      matchPercent: computeMatchPercent(skills, `${job.title} ${job.description}`),
    }));

    // Sort by match percent
    results.sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));

    // Pagination
    const perPage = 10;
    const start = (page - 1) * perPage;
    const pageJobs = results.slice(start, start + perPage);

    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / perPage);

    return NextResponse.json({ jobs: pageJobs, totalResults, totalPages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ jobs: [] });
  }
}
