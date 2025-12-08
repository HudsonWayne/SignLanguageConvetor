// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";

/**
 * Aggregates jobs from multiple sources, cleans descriptions for safe display.
 */

// Simple HTML sanitizer: strips all HTML tags
function cleanHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

// Fetch text safely
async function safeFetchText(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FastApplyBot/1.0)" },
      cache: "no-store",
    });
    return await res.text();
  } catch (e) {
    console.error("safeFetchText error", url, e);
    return "";
  }
}

// Fetch JSON safely
async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FastApplyBot/1.0)" },
      cache: "no-store",
    });
    return await res.json();
  } catch (e) {
    console.error("safeFetchJson error", url, e);
    return null;
  }
}

// Parse RSS feed items
function parseRSSItems(xml: string) {
  const items: any[] = [];
  if (!xml) return items;
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml))) {
    const block = match[1];
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(block);
      return m ? cleanHtml(m[1]) : "";
    };
    items.push({
      title: get("title"),
      company: get("dc:creator") || "",
      link: get("link") || get("guid") || "",
      location: get("category") || "Remote",
      description: get("description") || "",
      salary: null,
      source: "RSS",
    });
  }
  return items;
}

// Normalize job structure
function normalize(job: any) {
  return {
    title: (job.title || "").trim(),
    company: (job.company || "").trim() || (job.source === "FindWork" ? job.company_name || "" : ""),
    description: cleanHtml(job.description || job.text || ""),
    location: (job.location || job.category || "Remote").trim() || "Remote",
    link: (job.link || job.url || job.apply_url || "").trim(),
    salary: job.salary ? (Number(job.salary) || job.salary) : null,
    source: job.source || "Unknown",
  };
}

// Remove duplicate jobs
function dedupe(jobs: any[]) {
  const seen = new Map<string, any>();
  for (const j of jobs) {
    const key = (j.link || (j.title + "|" + j.company)).toLowerCase();
    if (!seen.has(key)) seen.set(key, j);
  }
  return Array.from(seen.values());
}

// API handler
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toString().trim().toLowerCase();
  const minSalary = Number(body.minSalary || 0);
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];

  // 1) Jobicy
  const jobicyXml = await safeFetchText("https://jobicy.com/feed");
  const jobicy = parseRSSItems(jobicyXml).map((j) => ({ ...j, source: "Jobicy" }));

  // 2) WorkAnywhere
  const waXml = await safeFetchText("https://workanywhere.pro/jobs/feed/");
  const workAnywhere = parseRSSItems(waXml).map((j) => ({ ...j, source: "WorkAnywhere" }));

  // 3) FindWork
  let findwork: any[] = [];
  try {
    const findworkJson = await safeFetchJson("https://findwork.dev/api/jobs/?remote=true");
    if (findworkJson && Array.isArray(findworkJson.results)) {
      findwork = findworkJson.results.map((job: any) => ({
        title: job.role || "",
        company: job.company_name || "",
        description: cleanHtml(job.text || ""),
        location: job.location || "Remote",
        link: job.url || job.apply_url || "",
        salary: job.salary || null,
        source: "FindWork",
      }));
    }
  } catch (e) {
    console.error("findwork parse error", e);
  }

  // 4) RemoteOK
  let remoteok: any[] = [];
  try {
    const ro = await safeFetchJson("https://remoteok.com/api");
    if (Array.isArray(ro)) {
      for (let i = 0; i < ro.length; i++) {
        const r = ro[i];
        if (!r || !r.position) continue;
        remoteok.push({
          title: r.position || r.title || "",
          company: r.company || "",
          description: cleanHtml(r.description || r.tags?.join(" ") || ""),
          location: r.location || r.country || (r.remote ? "Remote" : ""),
          link: r.url || r.url_ro || `https://remoteok.com/remote-jobs/${r.id}`,
          salary: r.salary || null,
          source: "RemoteOK",
        });
      }
    }
  } catch (e) {
    console.error("remoteok error", e);
  }

  // 5) WeWorkRemotely
  const wwrXml = await safeFetchText("https://weworkremotely.com/remote-jobs.rss");
  const wwr = parseRSSItems(wwrXml).map((j) => ({ ...j, source: "WeWorkRemotely" }));

  // Merge, normalize, dedupe
  let all = [...jobicy, ...workAnywhere, ...findwork, ...remoteok, ...wwr].map(normalize);
  all = dedupe(all);

  // Filter by keywords
  if (keywords.length > 0) {
    const kws = keywords.map((k) => k.toLowerCase());
    all = all.filter((job) =>
      kws.some((kw) =>
        (job.title + " " + job.description + " " + job.company).toLowerCase().includes(kw)
      )
    );
  }

  // Filter by country (soft)
  let filtered = country
    ? all.filter((job) => (job.location || "remote").toLowerCase().includes(country))
    : all;
  if (filtered.length === 0) filtered = all;

  // Filter by min salary (soft)
  let filteredSalary = minSalary > 0
    ? filtered.filter((job) => job.salary && Number(job.salary) >= minSalary)
    : filtered;
  if (filteredSalary.length === 0) filteredSalary = filtered;

  const result = filteredSalary.slice(0, 200);
  return NextResponse.json(result);
}
