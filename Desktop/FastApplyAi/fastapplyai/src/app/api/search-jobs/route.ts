// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

/* ========================== TYPES ========================== */
interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  link: string;
  source: string;
  match?: number;
}

/* ========================== HELPERS ========================== */
function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

async function safeFetch(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) return "";
    return await res.text();
  } catch (e) {
    console.error("safeFetch failed for", url, e);
    return "";
  }
}

/* ====================== ZIMBAJOB SCRAPER (may fail without Playwright) ====================== */
async function fetchZimbaJobLinks(): Promise<string[]> {
  const links = new Set<string>();
  for (let page = 1; page <= 3; page++) {
    try {
      const url =
        page === 1
          ? "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
          : `https://www.zimbajob.com/job-vacancies-search-zimbabwe?page=${page}`;
      const html = await safeFetch(url);
      if (!html) continue;
      const $ = load(html);
      $("h3 a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/job-vacancies-zimbabwe/")) {
          links.add(`https://www.zimbajob.com${href}`);
        }
      });
    } catch (e) {
      console.error("ZimbaJob page failed", page, e);
      continue;
    }
  }
  return Array.from(links);
}

async function fetchZimbaJobDetails(url: string): Promise<Job | null> {
  try {
    const html = await safeFetch(url);
    if (!html) return null;
    const $ = load(html);

    const title = clean($("h1").first().text());
    if (!title) return null;

    const company = clean($(".card-block-company h3 a").first().text()) || "Unknown Company";
    const location =
      clean($(".withicon.location-dot span").first().text()) ||
      clean($("li:contains('Region') span").text()) ||
      "Zimbabwe";

    const description = clean($(".job-description").text() + " " + $(".job-qualifications").text());
    const skills: string[] = [];
    $(".skills li").each((_, el) => {
      const s = clean($(el).text());
      if (s) skills.push(s);
    });

    return { title, company, location, description, skills, link: url, source: "ZimbaJob" };
  } catch (e) {
    console.error("ZimbaJob details failed for", url, e);
    return null;
  }
}

/* ====================== INDEED SCRAPER ====================== */
async function fetchIndeedJobs(country: string): Promise<Job[]> {
  const jobs: Job[] = [];
  try {
    const url = `https://www.indeed.com/jobs?q=&l=${country}`;
    const html = await safeFetch(url);
    if (!html) return jobs;

    const $ = load(html);

    // Updated selectors for Indeed
    $("a.jcs-JobTitle").each((_, el) => {
      const title = clean($(el).text());
      if (!title) return;

      const parent = $(el).closest(".result");
      const company = clean(parent.find(".companyName").text()) || "Unknown Company";
      const location = clean(parent.find(".companyLocation").text()) || country;
      const description = clean(parent.find(".job-snippet").text());
      const linkPartial = $(el).attr("href");
      if (!linkPartial) return;

      const fullLink = linkPartial.startsWith("http") ? linkPartial : `https://www.indeed.com${linkPartial}`;
      jobs.push({ title, company, location, description, skills: [], link: fullLink, source: "Indeed" });
    });
  } catch (e) {
    console.error("Indeed fetch failed", e);
  }
  return jobs;
}

/* ====================== LINKEDIN SCRAPER (placeholder) ====================== */
async function fetchLinkedInJobs(country: string): Promise<Job[]> {
  return []; // blocked by LinkedIn
}

/* ============================ API ============================ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];

  // Fetch jobs
  const zimbaLinks = await fetchZimbaJobLinks();
  const zimbaJobsRaw = await Promise.all(zimbaLinks.map(fetchZimbaJobDetails));
  const zimbaJobs = zimbaJobsRaw.filter(Boolean) as Job[];

  const indeedJobs = await fetchIndeedJobs(country);
  const linkedInJobs = await fetchLinkedInJobs(country);

  let jobs: Job[] = [...zimbaJobs, ...indeedJobs, ...linkedInJobs];

  // Filter by country / remote
  if (country) {
    jobs = jobs.filter(j => {
      const loc = j.location.toLowerCase();
      return loc.includes(country) || loc.includes("zimbabwe") || loc.includes("remote");
    });
  }

  // Filter by keywords
  if (keywords.length) {
    const kw = keywords.map(k => k.toLowerCase());
    jobs = jobs.filter(j => {
      const text = (j.title + " " + j.description + " " + (j.skills || []).join(" ")).toLowerCase();
      return kw.some(k => text.includes(k));
    });
  }

  // Compute match %
  jobs = jobs.map(j => {
    let score = 0;
    const text = (j.title + " " + j.description + " " + (j.skills || []).join(" ")).toLowerCase();
    keywords.forEach(k => { if (text.includes(k.toLowerCase())) score += 25; });
    if (j.location.toLowerCase().includes(country)) score += 30;
    if (j.location.toLowerCase().includes("remote")) score += 10;
    if (score > 100) score = 100;
    return { ...j, match: score };
  });

  jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

  return NextResponse.json(jobs.slice(0, 100));
}
