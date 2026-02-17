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
}

/* ================= AI SKILLS ================= */

const AI_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node",
  "python",
  "django",
  "flask",
  "java",
  "spring",
  "c#",
  ".net",
  "php",
  "laravel",
  "mysql",
  "postgres",
  "mongodb",
  "docker",
  "aws",
  "azure",
  "html",
  "css",
  "git",
  "api",
  "ui",
  "ux",
];

function extractSkills(text: string) {
  const found: string[] = [];
  const lower = text.toLowerCase();

  for (const skill of AI_SKILLS) {
    if (lower.includes(skill)) {
      found.push(skill);
    }
  }

  return found;
}

/* ================= FETCH HTML ================= */

async function fetchHTML(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    return await res.text();
  } catch {
    return "";
  }
}

/* ================= ZIMBAJOB ================= */

async function fetchZimJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  const html = await fetchHTML(
    "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
  );

  const $ = load(html);

  $(".job-listing").each((i, el) => {
    const title = $(el).find("a.job-title").text().trim();
    const link = $(el).find("a.job-title").attr("href");
    const company = $(el).find(".company-name").text().trim();
    const location = $(el).find(".job-location").text().trim();
    const description = $(el).find(".job-description").text().trim();

    if (!title) return;

    jobs.push({
      title,
      company,
      location,
      description,
      link: "https://www.zimbajob.com" + link,
      source: "ZimJob",
      skills: extractSkills(description),
      postedAt: new Date().toISOString(),
    });
  });

  return jobs;
}

/* ================= IHARARE ================= */

async function fetchIHarare(): Promise<Job[]> {
  const jobs: Job[] = [];

  const html = await fetchHTML("https://ihararejobs.com/");

  const $ = load(html);

  $("a[href*='/job/']").each((i, el) => {
    const title = $(el).text().trim();
    const link = $(el).attr("href");

    if (!title) return;

    jobs.push({
      title,
      company: "Zimbabwe Employer",
      location: "Zimbabwe",
      description: title,
      link: link || "",
      source: "iHarare",
      skills: extractSkills(title),
      postedAt: new Date().toISOString(),
    });
  });

  return jobs;
}

/* ================= REMOTE JOBS ================= */

async function fetchRemoteJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  const res = await fetch(
    "https://remotive.com/api/remote-jobs"
  );

  const json = await res.json();

  for (const j of json.jobs.slice(0, 30)) {
    jobs.push({
      title: j.title,
      company: j.company_name,
      location: "Remote",
      description: j.description,
      link: j.url,
      source: "Remotive",
      skills: extractSkills(j.description),
      remote: true,
      postedAt: j.publication_date,
    });
  }

  return jobs;
}

/* ================= MATCH ================= */

function matchScore(job: Job, userSkills: string[]) {
  if (userSkills.length === 0) return 50;

  let match = 0;

  for (const skill of userSkills) {
    if (job.skills.includes(skill.toLowerCase())) {
      match++;
    }
  }

  return Math.round((match / userSkills.length) * 100);
}

/* ================= MAIN API ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userSkills: string[] = body.keywords || [];

    const [zim, iharare, remote] = await Promise.all([
      fetchZimJobs(),
      fetchIHarare(),
      fetchRemoteJobs(),
    ]);

    let jobs = [...zim, ...iharare, ...remote];

    jobs = jobs.map((job) => ({
      ...job,
      match: matchScore(job, userSkills),
    }));

    jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

    return NextResponse.json(jobs.slice(0, 50));

  } catch (error) {
    console.log(error);

    return NextResponse.json([]);
  }
}
