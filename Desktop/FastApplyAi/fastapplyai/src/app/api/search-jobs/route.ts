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
      headers: {
        "User-Agent": "Mozilla/5.0 (QuickApplyAI Bot)",
      },
      cache: "no-store",
    });

    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

/* ====================== STEP 1: LISTINGS ===================== */
async function fetchZimbaJobLinks() {
  const links = new Set<string>();

  for (let page = 1; page <= 5; page++) {
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

async function fetchZimbaJobDetails(url: string) {
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = load(html);

  const title = clean($("h1").first().text());
  if (!title) return null;

  const company =
    clean($(".card-block-company h3 a").first().text()) ||
    "Unknown Company";

  const location =
    clean($(".withicon.location-dot span").first().text()) ||
    clean($("li:contains('Region') span").text()) ||
    "Zimbabwe";

  const description = clean(
    $(".job-description").text() + " " + $(".job-qualifications").text()
  );

  const salary = clean($("li:contains('Salary') span").text());

  const skills: string[] = [];
  $(".skills li").each((_, el) => {
    const s = clean($(el).text());
    if (s) skills.push(s);
  });

  // Basic remote detection
  const remote = description.toLowerCase().includes("remote");

  return {
    title,
    company,
    location,
    description,
    salary,
    skills,
    link: url,
    source: "ZimbaJob",
    remote,
  };
}

/* ===================== MOCK / SECOND SOURCE ===================== */
async function fetchMockJobs(country: string) {
  // This simulates another site (replace with real scraping/API later)
  const jobs = [
    {
      title: "Frontend Developer",
      company: "TechCorp",
      location: country || "Harare",
      description: "Looking for React developer, remote friendly",
      salary: "$1200",
      skills: ["React", "JavaScript"],
      link: "https://www.example.com/job/1",
      source: "ExampleJobs",
      remote: true,
    },
    {
      title: "Backend Engineer",
      company: "DataSolutions",
      location: country || "Bulawayo",
      description: "Node.js developer needed",
      salary: "$1000",
      skills: ["Node.js", "Express", "MongoDB"],
      link: "https://www.example.com/job/2",
      source: "ExampleJobs",
      remote: false,
    },
  ];
  return jobs;
}

/* ============================ API ============================ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords)
    ? body.keywords
    : [];
  const filterRemote: boolean = !!body.remote;

  /* 1️⃣ Fetch ZimbaJobs */
  const zLinks = await fetchZimbaJobLinks();
  const zJobsRaw = (await Promise.all(zLinks.slice(0, 60).map(fetchZimbaJobDetails))).filter(Boolean);

  /* 2️⃣ Fetch Mock / Other source */
  const mockJobsRaw = await fetchMockJobs(country);

  /* 3️⃣ Combine & deduplicate */
  const allJobsMap = new Map<string, any>();
  [...zJobsRaw, ...mockJobsRaw].forEach((j) => {
    const key = `${j.title}-${j.company}-${j.location}`;
    if (!allJobsMap.has(key)) allJobsMap.set(key, j);
  });
  let jobs = Array.from(allJobsMap.values());

  /* 4️⃣ Location filter */
  if (country) {
    jobs = jobs.filter((j) => {
      const loc = j.location.toLowerCase();
      return (
        loc.includes(country) ||
        loc.includes("zimbabwe") ||
        loc.includes("harare") ||
        loc.includes("bulawayo") ||
        (filterRemote && j.remote)
      );
    });
  }

  /* 5️⃣ Remote filter */
  if (filterRemote) {
    jobs = jobs.filter((j) => j.remote);
  }

  /* 6️⃣ Skill / keyword filter */
  if (keywords.length) {
    const kw = keywords.map((k) => k.toLowerCase());
    jobs = jobs.filter((j) =>
      kw.some(
        (k) =>
          j.title.toLowerCase().includes(k) ||
          j.description.toLowerCase().includes(k) ||
          j.skills.join(" ").toLowerCase().includes(k)
      )
    );
  }

  /* 7️⃣ Fallback to Zimbabwe local jobs */
  if (!jobs.length) {
    jobs = [...zJobsRaw].filter((j) => j.location.toLowerCase().includes("zimbabwe"));
  }

  // ✅ Return top 100 jobs
  return NextResponse.json(jobs.slice(0, 100));
}
