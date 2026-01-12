// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

/* ========================== HELPERS ========================== */
function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (QuickApplyAI Bot)" },
      cache: "no-store",
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

/* ====================== STEP 1: ZIMBAJOB LISTINGS ===================== */
async function fetchZimbaJobLinks() {
  const links = new Set<string>();
  for (let page = 1; page <= 3; page++) {
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
  }
  return Array.from(links);
}

/* ===================== STEP 2: DETAILS ======================= */
async function fetchJobDetails(url: string, source = "ZimbaJob") {
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
  const salary = clean($("li:contains('Salary') span").text());
  const skills: string[] = [];
  $(".skills li").each((_, el) => {
    const s = clean($(el).text());
    if (s) skills.push(s);
  });
  return { title, company, location, description, salary, skills, link: url, source };
}

/* ====================== STEP 3: MULTI-SOURCE ======================= */
async function fetchOtherSources(country: string) {
  const jobs: any[] = [];

  // Example: Mock Indeed scraping (replace with real scraping if allowed)
  const indeedUrl = `https://www.indeed.com/jobs?q=&l=${country}`;
  const html = await safeFetch(indeedUrl);
  if (html) {
    const $ = load(html);
    $("a.jobtitle").each((_, el) => {
      const title = clean($(el).text());
      const link = $(el).attr("href")?.startsWith("http") ? $(el).attr("href") : "https://www.indeed.com" + $(el).attr("href");
      if (title && link) {
        jobs.push({
          title,
          company: "Unknown Company",
          location: country,
          description: "",
          skills: [],
          link,
          source: "Indeed",
        });
      }
    });
  }

  return jobs;
}

/* ============================ API ============================ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];

  // 1️⃣ ZimbaJob links
  const links = await fetchZimbaJobLinks();
  const zimbaJobsRaw = await Promise.all(links.slice(0, 60).map((url) => fetchJobDetails(url)));

  let jobs = (zimbaJobsRaw.filter(Boolean) as any[]).map((job) => ({
    ...job,
    match: 0, // placeholder for match %
  }));

  // 2️⃣ Other sources
  const otherJobs = await fetchOtherSources(country);
  jobs = [...jobs, ...otherJobs];

  // 3️⃣ Compute match %
  jobs = jobs.map((job) => {
    let score = 0;
    const titleDesc = (job.title + " " + job.description + " " + job.skills.join(" ")).toLowerCase();
    // Skill matching
    keywords.forEach((k) => {
      if (titleDesc.includes(k.toLowerCase())) score += 20;
    });
    // Location boost
    if (job.location.toLowerCase().includes(country)) score += 30;
    if (job.location.toLowerCase().includes("remote")) score += 10;
    if (score > 100) score = 100;
    return { ...job, match: score };
  });

  // 4️⃣ Sort by match %
  jobs.sort((a, b) => b.match - a.match);

  // 5️⃣ Return top 100 jobs
  return NextResponse.json(jobs.slice(0, 100));
}
