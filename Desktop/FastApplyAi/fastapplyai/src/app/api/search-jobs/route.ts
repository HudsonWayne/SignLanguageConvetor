import { NextResponse } from "next/server";
import { load } from "cheerio";

// SAFE FETCH
async function safeFetch(url: string, opts: RequestInit = {}) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Accept: "text/html",
    ...opts.headers,
  };
  try { return await fetch(url, { ...opts, headers }); }
  catch { return new Response("", { status: 500 }); }
}

function txt(s: any) { return (s || "").toString().trim().replace(/\s+/g, " "); }

// SCRAPERS
async function scrapeCvPeople(query: string) { /* same as your previous function */ }
async function scrapeJobsZimbabwe(query: string) { /* same as your previous function */ }
async function scrapePindula(query: string) { /* same as your previous function */ }

// COMPUTE MATCH PERCENT
function computeMatchPercent(skills: string[], text: string) {
  if (!skills || skills.length === 0) return 0;
  const lower = (text || "").toLowerCase();
  let count = 0;
  for (const s of skills) if (lower.includes(s.toLowerCase())) count++;
  return Math.max(Math.round((count / skills.length) * 100), 10);
}

// POST HANDLER
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills: string[] = body.skills || [];
    const country: string = body.country || "";
    const minSalary: number = Number(body.minSalary || 0);
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

    // Country filter
    if (country) {
      const cLower = country.toLowerCase();
      results = results.filter(job => {
        const loc = (job.location || "").toLowerCase();
        return loc.includes(cLower) || loc.includes("remote") || loc === "";
      });
    }

    // Compute match
    results = results.map(job => ({
      ...job,
      matchPercent: computeMatchPercent(skills, `${job.title} ${job.description}`),
    }));

    // Salary filter
    results = results.filter(job => {
      if (!job.salary || job.salary === "Not provided") return minSalary <= 0;
      const num = parseInt(job.salary.replace(/\D/g, ""));
      return num >= minSalary;
    });

    // Sort
    results.sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));

    // Pagination
    const perPage = 10;
    const start = (page - 1) * perPage;
    const pageJobs = results.slice(start, start + perPage);
    const totalPages = Math.ceil(results.length / perPage);

    return NextResponse.json({ jobs: pageJobs, totalPages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ jobs: [] });
  }
}
