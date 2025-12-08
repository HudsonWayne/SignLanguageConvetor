// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";

// --- SAFE FETCH HELPER ---
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

// --- SIMPLE RSS PARSER ---
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

// --- MAIN API ---
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const minSalary = Number(body.minSalary || 0);
  const keywords: string[] = body.keywords || [];

  // 1️⃣ Jobicy
  const jobicyXML = await safeFetch("https://jobicy.com/feed");
  const jobicyJobs = parseRSS(jobicyXML).map((j) => ({ ...j, source: "Jobicy" }));

  // 2️⃣ WorkAnywhere
  const waXML = await safeFetch("https://workanywhere.pro/jobs/feed/");
  const waJobs = parseRSS(waXML).map((j) => ({ ...j, source: "WorkAnywhere" }));

  // 3️⃣ FindWork
  let findworkJobs: any[] = [];
  try {
    const res = await fetch("https://findwork.dev/api/jobs/?remote=true", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const data = await res.json();
    findworkJobs = data.results.map((r: any) => ({
      title: r.role,
      company: r.company_name,
      description: r.text,
      location: r.location || "Remote",
      salary: r.salary || null,
      link: r.url ?? `https://findwork.dev/jobs/${r.id}`,
      source: "FindWork",
    }));
  } catch (e) {
    console.error("FindWork error", e);
  }

  // 4️⃣ RemoteOK (example)
  let remoteOKJobs: any[] = [];
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const data = await res.json();
    remoteOKJobs = data
      .filter((r: any) => r.position)
      .map((r: any) => ({
        title: r.position,
        company: r.company,
        description: r.description || r.tags?.join(" ") || "",
        location: r.location || r.country || (r.remote ? "Remote" : ""),
        salary: r.salary || null,
        link: (r.url || r.url_ro) ?? `https://remoteok.com/remote-jobs/${r.id}`,
        source: "RemoteOK",
      }));
  } catch (e) {
    console.error("RemoteOK error", e);
  }

  // Merge all jobs
  let allJobs = [...jobicyJobs, ...waJobs, ...findworkJobs, ...remoteOKJobs];

  // --- Filter by keywords (skills from CV)
  if (keywords.length > 0) {
    allJobs = allJobs.filter((job) =>
      keywords.some((skill) =>
        job.title.toLowerCase().includes(skill.toLowerCase()) ||
        job.description.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  // --- Filter by country
  let filtered = country
    ? allJobs.filter((job) => job.location.toLowerCase().includes(country))
    : allJobs;
  if (filtered.length === 0) filtered = allJobs;

  // --- Filter by salary
  let filteredSalary =
    minSalary > 0
      ? filtered.filter((job) => job.salary && Number(job.salary) >= minSalary)
      : filtered;
  if (filteredSalary.length === 0) filteredSalary = filtered;

  return NextResponse.json(filteredSalary);
}
