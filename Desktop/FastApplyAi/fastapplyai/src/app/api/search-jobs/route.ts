// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";

// ---- SAFE FETCH ----
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

// ---- SIMPLE RSS PARSER ----
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
    });
  }

  return items;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = body.country || "";
  const minSalary = Number(body.minSalary || 0);

  // ---------- 1) JOBICY ----------
  const jobicyXML = await safeFetch("https://jobicy.com/feed");
  let jobicyJobs = parseRSS(jobicyXML)
    .filter((j) => j.link.includes("/job/")) // remove articles
    .map((j) => ({
      ...j,
      source: "Jobicy",
      salary: null,
    }));

  // ---------- 2) WORKANYWHERE ----------
  const waXML = await safeFetch("https://workanywhere.pro/jobs/feed/");
  let waJobs = parseRSS(waXML)
    .filter((j) => j.link.includes("/jobs/"))
    .map((j) => ({
      ...j,
      source: "WorkAnywhere",
      salary: null,
    }));

  // ---------- 3) FINDWORK ----------
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
      salary: job.salary || 0,
      source: "FindWork",
    }));
  } catch (e) {
    console.error("Findwork error", e);
  }

  // ---------- MERGE ----------
  let allJobs = [...jobicyJobs, ...waJobs, ...findworkJobs];

  // ---------- FILTER: COUNTRY ----------
  if (country.trim() !== "") {
    allJobs = allJobs.filter((job) =>
      job.location.toLowerCase().includes(country.toLowerCase())
    );
  }

  // ---------- FILTER: SALARY ----------
  if (minSalary > 0) {
    allJobs = allJobs.filter((job) => job.salary && job.salary >= minSalary);
  }

  return NextResponse.json(allJobs);
}
