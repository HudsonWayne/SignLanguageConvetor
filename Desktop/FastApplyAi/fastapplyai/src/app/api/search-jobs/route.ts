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
const clean = (t = "") => t.replace(/\s+/g, " ").trim();

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      },
      cache: "no-store",
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

/* ====================== ZIMBAJOB ====================== */
async function fetchZimbaJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const base = "https://www.zimbajob.com";

  const html = await safeFetch(
    "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
  );
  if (!html) return jobs;

  const $ = load(html);

  $("a.job-title").each((_, el) => {
    const title = clean($(el).text());
    const href = $(el).attr("href");
    if (!title || !href) return;

    const card = $(el).closest(".job-listing");

    const company =
      clean(card.find(".company-name").text()) || "Unknown Company";

    const location =
      clean(card.find(".job-location").text()) || "Zimbabwe";

    const description =
      clean(card.find(".job-description").text()) ||
      "See full description on employer site.";

    jobs.push({
      title,
      company,
      location,
      description,
      skills: [],
      link: href.startsWith("http") ? href : `${base}${href}`,
      source: "ZimbaJob",
    });
  });

  return jobs;
}

/* ============================ API ============================ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = body.keywords || [];

  let jobs = await fetchZimbaJobs();

  /* COUNTRY FILTER (SOFT) */
  if (country) {
    jobs = jobs.filter(j =>
      j.location.toLowerCase().includes(country) ||
      country.includes("zim")
    );
  }

  /* MATCH SCORE */
  jobs = jobs.map(j => {
    let score = 20; // base score

    const text = `${j.title} ${j.description}`.toLowerCase();

    keywords.forEach(k => {
      if (text.includes(k.toLowerCase())) score += 10;
    });

    if (j.location.toLowerCase().includes("remote")) score += 15;
    if (score > 100) score = 100;

    return { ...j, match: score };
  });

  jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

  return NextResponse.json(jobs.slice(0, 50));
}
