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

/* ====================== ZIMBAJOB ====================== */

async function fetchZimbaLinks() {
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

async function fetchZimbaJob(url: string) {
  const html = await safeFetch(url);
  if (!html) return null;
  const $ = load(html);

  const title = clean($("h1").first().text());
  if (!title) return null;

  const company =
    clean($(".card-block-company h3 a").first().text()) || "Unknown Company";
  const location =
    clean($(".withicon.location-dot span").first().text()) ||
    clean($("li:contains('Region') span").text()) ||
    "Zimbabwe";
  const description = clean(
    $(".job-description").text() + " " + $(".job-qualifications").text()
  );
  const skills: string[] = [];
  $(".skills li").each((_, el) => {
    const s = clean($(el).text());
    if (s) skills.push(s);
  });

  return {
    title,
    company,
    location,
    description,
    skills,
    link: url,
    source: "ZimbaJob",
  };
}

/* ====================== INDEED ====================== */

async function fetchIndeedJobs(keywords: string[], country: string) {
  const jobs: any[] = [];
  const query = keywords.join("+") || "developer";
  const url = `https://www.indeed.com/jobs?q=${query}&l=${encodeURIComponent(
    country || "Zimbabwe"
  )}&limit=20`;

  const html = await safeFetch(url);
  if (!html) return jobs;

  const $ = load(html);
  $(".jobsearch-SerpJobCard").each((_, el) => {
    const title = clean($(el).find(".title a").text());
    const company = clean($(el).find(".company").text()) || "Unknown Company";
    const location = clean($(el).find(".location").text()) || country || "Remote";
    const linkPart = $(el).find(".title a").attr("href");
    const link = linkPart?.startsWith("http") ? linkPart : `https://www.indeed.com${linkPart}`;
    const description = clean($(el).find(".summary").text());

    if (title && link) {
      jobs.push({
        title,
        company,
        location,
        description,
        skills: [], // optional: could parse from description later
        link,
        source: "Indeed",
        remote: location.toLowerCase().includes("remote"),
      });
    }
  });

  return jobs;
}

/* ====================== LINKEDIN ====================== */

async function fetchLinkedInJobs(keywords: string[], country: string) {
  const jobs: any[] = [];
  const query = keywords.join(" ") || "developer";
  const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(
    query
  )}&location=${encodeURIComponent(country || "Zimbabwe")}`;

  const html = await safeFetch(url);
  if (!html) return jobs;

  const $ = load(html);
  $("li.jobs-search-results__list-item").each((_, el) => {
    const title = clean($(el).find("h3").text());
    const company = clean($(el).find("h4").text()) || "Unknown Company";
    const location = clean($(el).find(".job-result-card__location").text()) || country || "Remote";
    const link = $(el).find("a").attr("href");

    if (title && link) {
      jobs.push({
        title,
        company,
        location,
        description: "", // LinkedIn description requires extra fetch
        skills: [],
        link,
        source: "LinkedIn",
        remote: location.toLowerCase().includes("remote"),
      });
    }
  });

  return jobs;
}

/* ====================== DEDUPE ====================== */

function dedupeJobs(jobs: any[]) {
  const seen = new Set();
  return jobs.filter((j) => {
    const key = `${j.title}-${j.company}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ============================ API ============================ */

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];

  // 1️⃣ ZimbaJob
  const zLinks = await fetchZimbaLinks();
  const zJobsRaw = await Promise.all(zLinks.slice(0, 50).map(fetchZimbaJob));
  const zJobs = zJobsRaw.filter(Boolean) as any[];

  // 2️⃣ Indeed
  const iJobs = await fetchIndeedJobs(keywords, country);

  // 3️⃣ LinkedIn
  const lJobs = await fetchLinkedInJobs(keywords, country);

  // 4️⃣ Merge + dedupe
  let allJobs = dedupeJobs([...zJobs, ...iJobs, ...lJobs]);

  // 5️⃣ Skill / keyword filter
  if (keywords.length) {
    const kw = keywords.map((k) => k.toLowerCase());
    allJobs = allJobs.filter((j) =>
      kw.some(
        (k) =>
          j.title.toLowerCase().includes(k) ||
          j.description.toLowerCase().includes(k) ||
          j.skills.join(" ").toLowerCase().includes(k)
      )
    );
  }

  // 6️⃣ Location preference: favor local
  if (country) {
    allJobs.sort((a, b) => {
      const locA = a.location.toLowerCase();
      const locB = b.location.toLowerCase();
      const localMatchA = locA.includes(country) || locA.includes("zimbabwe");
      const localMatchB = locB.includes(country) || locB.includes("zimbabwe");

      // Local first, remote second
      if (localMatchA && !localMatchB) return -1;
      if (!localMatchA && localMatchB) return 1;
      if (a.remote && !b.remote) return 1;
      if (!a.remote && b.remote) return -1;
      return 0;
    });
  }

  // 7️⃣ Remote filter
  if (body.filter === "remote") {
    allJobs = allJobs.filter((j) => j.remote);
  }

  return NextResponse.json(allJobs.slice(0, 100));
}
