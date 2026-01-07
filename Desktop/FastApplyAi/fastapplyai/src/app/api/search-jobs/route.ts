// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

/* ----------------------------- HELPERS ----------------------------- */

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (FastApplyAI Bot)",
      },
      cache: "no-store",
    });
    return await res.text();
  } catch (e) {
    console.error("Fetch failed:", url);
    return "";
  }
}

/* ------------------------- STEP 1: LISTINGS ------------------------- */

async function fetchListingLinks() {
  const html = await safeFetch(
    "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
  );

  if (!html) return [];

  const $ = load(html);
  const links = new Set<string>();

  $("h3 a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/job-vacancies-zimbabwe/")) {
      links.add(`https://www.zimbajob.com${href}`);
    }
  });

  return Array.from(links);
}

/* ---------------------- STEP 2: JOB DETAILS ------------------------ */

async function fetchJobDetails(url: string) {
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = load(html);

  const title = clean($("h1").first().text());
  const company = clean(
    $(".card-block-company h3 a").first().text()
  );

  const location = clean(
    $(".withicon.location-dot span").first().text() || "Zimbabwe"
  );

  const description = clean(
    $(".job-description").text() +
      " " +
      $(".job-qualifications").text()
  );

  const salary = clean(
    $("li:contains('Salary expectations') span").text()
  );

  const skills: string[] = [];
  $(".skills li").each((_, el) => {
    skills.push(clean($(el).text()));
  });

  return {
    title,
    company: company || "Unknown Company",
    location,
    description,
    salary,
    skills,
    link: url,
    source: "ZimbaJob",
  };
}

/* ---------------------------- API ---------------------------- */

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const keywords: string[] = body.keywords || [];

  /* 1️⃣ Get job links */
  const links = await fetchListingLinks();

  /* 2️⃣ Fetch details */
  const jobsRaw = await Promise.all(
    links.slice(0, 20).map(fetchJobDetails)
  );

  let jobs = jobsRaw.filter(Boolean) as any[];

  /* 3️⃣ Country filter */
  if (country) {
    jobs = jobs.filter((j) =>
      j.location.toLowerCase().includes(country)
    );
  }

  /* 4️⃣ Skills filter */
  if (keywords.length) {
    const kw = keywords.map((k) => k.toLowerCase());
    jobs = jobs.filter((j) =>
      kw.some(
        (k) =>
          j.skills.join(" ").toLowerCase().includes(k) ||
          j.title.toLowerCase().includes(k) ||
          j.description.toLowerCase().includes(k)
      )
    );
  }

  /* 5️⃣ Fallback (remote/global) */
  if (!jobs.length) {
    jobs = jobsRaw.filter(Boolean) as any[];
  }

  return NextResponse.json(jobs.slice(0, 100));
}
