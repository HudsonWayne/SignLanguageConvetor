// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";

// Safe fetch helper
async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    return await res.text();
  } catch (e) {
    console.error("Fetch error:", url, e);
    return "";
  }
}

// Simple RSS parser
function parseRSS(xml: string) {
  const items: any[] = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml))) {
    const block = match[1];
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(block);
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "") : "";
    };
    items.push({
      title: get("title"),
      company: get("dc:creator") || "",
      link: get("link"),
      location: get("category") || "Remote",
      description: get("description"),
      salary: null,
      source: "RSS",
    });
  }
  return items;
}

// Main route
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = body.country?.toLowerCase() || "";
  const minSalary = Number(body.minSalary || 0);
  const keyword = body.keyword?.toLowerCase() || "";

  // 1️⃣ Jobicy
  const jobicyXML = await safeFetch("https://jobicy.com/feed");
  const jobicyJobs = parseRSS(jobicyXML)
    .filter((j) => j.link.includes("/job/"))
    .map((j) => ({ ...j, source: "Jobicy" }));

  // 2️⃣ WorkAnywhere
  const waXML = await safeFetch("https://workanywhere.pro/jobs/feed/");
  const waJobs = parseRSS(waXML)
    .filter((j) => j.link.includes("/jobs/"))
    .map((j) => ({ ...j, source: "WorkAnywhere" }));

  // 3️⃣ FindWork (JSON API)
  let findworkJobs: any[] = [];
  try {
    const res = await fetch("https://findwork.dev/api/jobs/?remote=true", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const data = await res.json();
    findworkJobs = data.results.map((job: any) => ({
      title: job.role,
      company: job.company_name,
      location: job.location || "Remote",
      description: job.text,
      link: job.url,
      salary: job.salary || null,
      source: "FindWork",
    }));
  } catch (e) {
    console.error("FindWork error", e);
  }

  // Merge all jobs
  let allJobs = [...jobicyJobs, ...waJobs, ...findworkJobs];

  // Filter by keyword
  if (keyword) {
    allJobs = allJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword)
    );
  }

  // Filter by country (soft)
  let filteredByCountry = country
    ? allJobs.filter((job) => job.location.toLowerCase().includes(country))
    : allJobs;

  if (filteredByCountry.length === 0) filteredByCountry = allJobs;

  // Filter by minSalary (soft)
  let filteredBySalary =
    minSalary > 0
      ? filteredByCountry.filter(
          (job) => job.salary && Number(job.salary) >= minSalary
        )
      : filteredByCountry;

  if (filteredBySalary.length === 0) filteredBySalary = filteredByCountry;

  return NextResponse.json(filteredBySalary);
}
