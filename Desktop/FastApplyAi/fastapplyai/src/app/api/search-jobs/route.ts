// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";

// --- UTIL: fetch text safely ---
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

// --- UTIL: parse RSS into JS objects ---
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
      source: "RSS",
    });
  }

  return items;
}

// --- MAIN ROUTE HANDLER ---
export async function POST() {
  // 1) Jobicy (remote jobs)
  const jobicyXML = await safeFetch("https://jobicy.com/feed");
  const jobicyJobs = parseRSS(jobicyXML).map((j) => ({
    ...j,
    source: "Jobicy",
  }));

  // 2) WorkAnywhere (remote jobs)
  const waXML = await safeFetch("https://workanywhere.pro/jobs/feed/");
  const waJobs = parseRSS(waXML).map((j) => ({
    ...j,
    source: "WorkAnywhere",
  }));

  // 3) Findwork (JSON simple)
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
      source: "Findwork",
    }));
  } catch (e) {
    console.error("Findwork error", e);
  }

  // --- Combine all job sources ---
  const allJobs = [...jobicyJobs, ...waJobs, ...findworkJobs];

  return NextResponse.json(allJobs);
}
