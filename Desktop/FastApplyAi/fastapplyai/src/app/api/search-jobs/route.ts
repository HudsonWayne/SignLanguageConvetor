// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

/* ================= TYPES ================= */
interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
  source: string;
  skills: string[];
  postedAt?: string;
  match?: number;
  remote?: boolean;
  applyType?: "email" | "external" | "manual";
}

/* ================= UNIVERSAL SKILL EXTRACTOR ================= */
function extractSkills(text: string): string[] {
  const STOP_WORDS = new Set([
    "the","and","for","with","from","that","this",
    "have","has","had","you","your","are","was","were",
    "will","shall","can","could","would","should",
    "job","work","experience","years","skills","section",
    "using","use","used","over","under","between",
    "a","an","to","of","in","on","at","by","or"
  ]);

  const clean = text.toLowerCase().replace(/[^a-z0-9+#. ]/g," ").split(/\s+/);
  const words: string[] = [];

  for(const w of clean){
    if(w.length > 2 && w.length < 25 && !STOP_WORDS.has(w) && !words.includes(w)){
      words.push(w);
    }
  }

  return words.slice(0, 60);
}

/* ================= FETCH HTML ================= */
async function fetchHTML(url: string){
  try{
    const res = await fetch(url, { headers:{ "User-Agent":"Mozilla/5.0" }, cache:"no-store" });
    return await res.text();
  }catch{
    return "";
  }
}

/* ================= ZIMBABWE JOB SOURCES ================= */
async function fetchZimJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const html = await fetchHTML("https://www.zimbajob.com/job-vacancies-search-zimbabwe");
  const $ = load(html);

  $(".job-listing").each((i, el) => {
    const title = $(el).find("a.job-title").text().trim();
    const link = $(el).find("a.job-title").attr("href");
    const company = $(el).find(".company-name").text().trim();
    const location = $(el).find(".job-location").text().trim();
    const description = $(el).find(".job-description").text().trim();

    if (!title || !link) return;

    jobs.push({
      title,
      company,
      location,
      description,
      link: "https://www.zimbajob.com" + link,
      source: "ZimJob",
      skills: extractSkills(title + " " + description),
      postedAt: new Date().toISOString(),
      remote: false,
      applyType: "external",
    });
  });

  return jobs;
}

async function fetchIHarare(): Promise<Job[]> {
  const jobs: Job[] = [];
  const html = await fetchHTML("https://ihararejobs.com/");
  const $ = load(html);

  $("a[href*='/job/']").each((i, el) => {
    const title = $(el).text().trim();
    const link = $(el).attr("href");
    if (!title || !link) return;

    jobs.push({
      title,
      company: "Zimbabwe Employer",
      location: "Zimbabwe",
      description: title,
      link,
      source: "iHarare",
      skills: extractSkills(title),
      postedAt: new Date().toISOString(),
      remote: false,
      applyType: "external",
    });
  });

  return jobs;
}

async function fetchRemoteJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const res = await fetch("https://remotive.com/api/remote-jobs");
  const json = await res.json();

  for (const j of json.jobs.slice(0, 40)) {
    jobs.push({
      title: j.title,
      company: j.company_name,
      location: "Remote",
      description: j.description,
      link: j.url,
      source: "Remotive",
      remote: true,
      skills: extractSkills(j.title + " " + j.description),
      postedAt: j.publication_date,
      applyType: "external",
    });
  }

  return jobs;
}

/* ================= MATCH SCORE ================= */
function matchScore(job: Job, userSkills: string[]): number {
  if (userSkills.length === 0) return 50;

  let score = 0;
  for (const skill of userSkills) {
    if (job.skills.includes(skill)) score++;
  }

  // Boost Zimbabwe jobs by +10 points
  if (job.location?.toLowerCase().includes("zimbabwe")) score += 10;

  return Math.round((score / userSkills.length) * 100);
}

/* ================= MAIN API ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cvText: string = body.cvText || "";
    const keywords: string[] = body.keywords || [];
    const user = body.user || {}; // optional user info

    const userSkills = [
      ...extractSkills(cvText),
      ...keywords.map(k => k.toLowerCase()),
    ];

    // Fetch all jobs concurrently
    const [zim, iharare, remote] = await Promise.all([
      fetchZimJobs(),
      fetchIHarare(),
      fetchRemoteJobs(),
    ]);

    let jobs: Job[] = [...zim, ...iharare, ...remote];

    // Compute match
    jobs = jobs.map(job => ({
      ...job,
      match: matchScore(job, userSkills),
    }));

    // Sort Zimbabwe first, then by match
    jobs.sort((a, b) => {
      const aRemote = a.remote ? 1 : 0;
      const bRemote = b.remote ? 1 : 0;
      if (aRemote !== bRemote) return aRemote - bRemote;
      return (b.match || 0) - (a.match || 0);
    });

    /* ================= AUTO-APPLY LOGIC ================= */
    for (const job of jobs) {
      try {
        await fetch(`${process.env.BASE_URL}/api/apply-job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job, applicant: user }),
        });
      } catch (err) {
        console.log("Auto-apply failed for job:", job.link, err);
      }
    }

    return NextResponse.json(jobs);
  } catch (e) {
    console.error("Search-Jobs API error:", e);
    return NextResponse.json([]);
  }
}
