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

/* ================= UNIVERSAL SKILL EXTRACTOR ================= */
// Works for any profession by extracting main words from CV text
function extractSkillsFromCV(cvText: string): string[] {
  const COMMON_WORDS = [
    "the","and","for","with","from","that","this",
    "have","has","had","you","your","are","was",
    "were","will","shall","can","could","would",
    "job","work","experience","years","skills","section"
  ];

  const words = cvText
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/);

  const skills: string[] = [];

  for (const word of words) {
    if (word.length > 2 && !COMMON_WORDS.includes(word) && !skills.includes(word)) {
      skills.push(word);
    }
  }

  return skills.slice(0, 50); // Limit to 50 skills
}

/* ================= FETCH HTML ================= */
async function fetchHTML(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
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
      skills: extractSkillsFromCV(description),
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

    if (!title || !link) return;

    jobs.push({
      title,
      company: "Zimbabwe Employer",
      location: "Zimbabwe",
      description: title,
      link,
      source: "iHarare",
      skills: extractSkillsFromCV(title),
      postedAt: new Date().toISOString(),
    });
  });

  return jobs;
}

/* ================= REMOTE JOBS ================= */
async function fetchRemoteJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const res = await fetch("https://remotive.com/api/remote-jobs");
  const json = await res.json();

  for (const j of json.jobs.slice(0, 30)) {
    jobs.push({
      title: j.title,
      company: j.company_name,
      location: "Remote",
      description: j.description,
      link: j.url,
      source: "Remotive",
      skills: extractSkillsFromCV(j.description),
      remote: true,
      postedAt: j.publication_date,
    });
  }

  return jobs;
}

/* ================= MATCH SCORE ================= */
function matchScore(job: Job, userSkills: string[]): number {
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

    // Accept either "cvText" or "keywords" array
    const cvText: string = body.cvText || "";
    const keywordSkills: string[] = body.keywords || [];
    const userSkills = [...extractSkillsFromCV(cvText), ...keywordSkills];

    // Fetch all jobs concurrently
    const [zim, iharare, remote] = await Promise.all([
      fetchZimJobs(),
      fetchIHarare(),
      fetchRemoteJobs(),
    ]);

    let jobs = [...zim, ...iharare, ...remote];

    // Compute match score
    jobs = jobs.map(job => ({
      ...job,
      match: matchScore(job, userSkills),
    }));

    // Sort best matches first
    jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

    return NextResponse.json(jobs.slice(0, 50));

  } catch (error) {
    console.log(error);
    return NextResponse.json([]);
  }
}
