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

async function fetchListingLinks() {
  const links = new Set<string>();

  // Crawl multiple pages for MANY real jobs
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

/* ===================== STEP 2: DETAILS ======================= */

async function fetchJobDetails(url: string) {
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
    $(".job-description").text() +
      " " +
      $(".job-qualifications").text()
  );

  const salary = clean(
    $("li:contains('Salary') span").text()
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
    salary,
    skills,
    link: url,
    source: "ZimbaJob",
  };
}

/* ============================ API ============================ */

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const country = (body.country || "").toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords)
    ? body.keywords
    : [];

  /* 1️⃣ Get MANY job links */
  const links = await fetchListingLinks();

  /* 2️⃣ Fetch MANY job details */
  const jobsRaw = await Promise.all(
    links.slice(0, 60).map(fetchJobDetails)
  );

  let jobs = jobsRaw.filter(Boolean) as any[];

  /* 3️⃣ Location filter */
  if (country) {
    jobs = jobs.filter((j) => {
      const loc = j.location.toLowerCase();
      return (
        loc.includes(country) ||
        loc.includes("zimbabwe") ||
        loc.includes("harare") ||
        loc.includes("bulawayo")
      );
    });
  }

  /* 4️⃣ Skill / keyword filter */
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

  /* 5️⃣ Fallback to local Zimbabwe jobs */
  if (!jobs.length) {
    jobs = jobsRaw.filter(
      (j) =>
        j &&
        j.location.toLowerCase().includes("zimbabwe")
    ) as any[];
  }

  // ✅ RETURN ARRAY (frontend-safe)
  return NextResponse.json(jobs.slice(0, 100));
}
