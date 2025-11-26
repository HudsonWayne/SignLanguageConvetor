// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

// --- Helper: safe fetch with headers
async function safeFetch(url: string, opts: RequestInit = {}) {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      ...((opts && opts.headers) || {}),
    };
    return await fetch(url, { ...opts, headers });
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response("", { status: 500 });
  }
}

// --- Helper: clean text
function txt(s: any) {
  return (s || "").toString().trim().replace(/\s+/g, " ");
}

// --- Scraper: CVPeople Africa
async function scrapeCvPeople(query: string) {
  try {
    const url = `https://www.cvpeopleafrica.com/jobs?q=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = load(html);
    const results: any[] = [];

    $(".text-dark .job-card, .job-card, .job-listing, li.job").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h4, h3, .job-title, .job-listing-title").first().text()) ||
        txt(el$.find("a").first().text());
      const company = txt(el$.find(".company, .employer, .company-name").first().text()) || "";
      let link = el$.find("a").first().attr("href") || "";
      if (link && !link.startsWith("http")) link = "https://www.cvpeopleafrica.com" + link;
      const location =
        txt(el$.find(".location, .job-location, .job-meta").first().text()) || "Zimbabwe";
      const desc = txt(el$.find(".description, .job-desc, .summary, p").first().text());

      if (title) {
        results.push({
          id: `cvp-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "CVPeople",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("CVPeople scrape error:", err);
    return [];
  }
}

// --- Scraper: JobsZimbabwe
async function scrapeJobsZimbabwe(query: string) {
  try {
    const url = `https://jobszimbabwe.co.zw/?s=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = load(html);
    const results: any[] = [];

    $(".job, .job-item, .listing").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h2, h3, .title, a").first().text()) ||
        txt(el$.find("a").first().text());
      const link = el$.find("a").first().attr("href") || "";
      const company = txt(el$.find(".company, .employer").first().text()) || "";
      const location = txt(el$.find(".location, .job-location").first().text()) || "Zimbabwe";
      const desc = txt(el$.find(".excerpt, .summary, p").first().text());

      if (title) {
        results.push({
          id: `jz-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "JobsZimbabwe",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("JobsZimbabwe scrape error:", err);
    return [];
  }
}

// --- Scraper: Pindula Jobs
async function scrapePindula(query: string) {
  try {
    const url = `https://jobs.pindula.co.zw/?s=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = load(html);
    const results: any[] = [];

    $(".job, article, .job-item, .post").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h2, a, .title").first().text()) ||
        txt(el$.find("a").first().text());
      const link = el$.find("a").first().attr("href") || "";
      const company = txt(el$.find(".company, .meta .company").first().text()) || "";
      const location = txt(el$.find(".location, .meta .location").first().text()) || "Zimbabwe";
      const desc = txt(el$.find(".entry-summary, p").first().text());

      if (title) {
        results.push({
          id: `pind-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "Pindula",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("Pindula scrape error:", err);
    return [];
  }
}

// --- Compute match percentage
function computeMatchPercent(skills: string[], text: string) {
  if (!skills || skills.length === 0) return 0;
  const lower = (text || "").toLowerCase();
  let count = 0;
  for (const s of skills) {
    if (!s) continue;
    if (lower.includes(s.toLowerCase())) count++;
  }
  const percent = Math.round((count / skills.length) * 100);
  return percent || 10;
}

// --- POST Route
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills: string[] = body.skills || [];
    const country: string = body.country || "Zimbabwe";
    const page = Number(body.page || 1);

    if (!skills || skills.length === 0) return NextResponse.json({ jobs: [] });

    const query = skills.slice(0, 6).join(" ");

    const [cvp, jz, pind] = await Promise.all([
      scrapeCvPeople(query),
      scrapeJobsZimbabwe(query),
      scrapePindula(query),
    ]);

    let results = [...cvp, ...jz, ...pind];

    // Deduplicate by title + company
    const seen = new Set<string>();
    results = results.filter((job) => {
      const key = `${job.title}|${job.company}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by country
    if (country) {
      const cLower = country.toLowerCase();
      results = results.filter((job) =>
        (job.location || "").toLowerCase().includes(cLower)
      );
    }

    // Compute match percent
    results = results.map((job) => ({
      ...job,
      matchPercent: computeMatchPercent(skills, `${job.title} ${job.description}`),
    }));

    // Sort by matchPercent descending
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
