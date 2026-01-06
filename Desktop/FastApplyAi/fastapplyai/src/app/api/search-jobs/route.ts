// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";

/**
 * Fetches jobs from multiple job sources (RSS + APIs + scraping),
 * cleans descriptions, normalizes fields, dedupes,
 * and returns filtered results.
 */

/* ------------------------- UTILITIES ------------------------- */

// Simple HTML sanitizer: removes all HTML tags
function cleanHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

// Safe text fetch
async function safeFetchText(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FastApplyBot/1.0)",
      },
      cache: "no-store",
    });
    return await res.text();
  } catch (e) {
    console.error("safeFetchText error:", url, e);
    return "";
  }
}

// Safe JSON fetch
async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FastApplyBot/1.0)",
      },
      cache: "no-store",
    });
    return await res.json();
  } catch (e) {
    console.error("safeFetchJson error:", url, e);
    return null;
  }
}

/* ------------------------- RSS PARSER ------------------------- */

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
      company: get("dc:creator"),
      link: get("link") || get("guid"),
      location: get("category") || "Remote",
      description: get("description"),
      source: "RSS",
    });
  }

  return items;
}

/* ------------------------- NORMALIZER ------------------------- */

function normalize(job: any) {
  const location = (job.location || job.category || "Remote").trim();

  return {
    title: (job.title || "").trim(),
    company: (job.company || "").trim(),
    description: cleanHtml(job.description || job.text || ""),
    location: location || "Remote", // Keep exact city/country
    link: (job.link || job.url || job.apply_url || "").trim(),
    source: job.source || "Unknown",
  };
}

function dedupe(jobs: any[]) {
  const seen = new Map<string, any>();

  for (const j of jobs) {
    const key = (j.link || `${j.title}|${j.company}`).toLowerCase();
    if (!seen.has(key)) seen.set(key, j);
  }

  return Array.from(seen.values());
}

/* ------------------------- ZIMBOJOBS SCRAPER ------------------------- */

async function fetchZimboJobs() {
  const jobs: any[] = [];

  const html = await safeFetchText("https://www.zimbojobs.com/jobs");
  if (!html) return jobs;

  const $ = load(html);

  $(".job-listing").each((_, el) => {
    const title = $(el).find("h3 a").text().trim();
    const link = $(el).find("h3 a").attr("href") || "";
    const company = $(el).find(".job-company").text().trim();
    const location = $(el).find(".job-location").text().trim() || "Zimbabwe";
    const description = $(el).find(".job-description").text().trim();

    if (!title || !link) return;

    jobs.push({
      title,
      company,
      description,
      location,
      link: link.startsWith("http")
        ? link
        : `https://www.zimbojobs.com${link}`,
      source: "ZimboJobs",
    });
  });

  return jobs;
}

/* ------------------------- MAIN HANDLER ------------------------- */

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const country = (body.country || "").toString().trim().toLowerCase();
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];

  /* ---------- 1) Jobicy ---------- */
  const jobicyXml = await safeFetchText("https://jobicy.com/feed");
  const jobicy = parseRSSItems(jobicyXml).map((j) => ({
    ...j,
    source: "Jobicy",
  }));

  /* ---------- 2) WorkAnywhere ---------- */
  const waXml = await safeFetchText("https://workanywhere.pro/jobs/feed/");
  const workAnywhere = parseRSSItems(waXml).map((j) => ({
    ...j,
    source: "WorkAnywhere",
  }));

  /* ---------- 3) FindWork API ---------- */
  let findwork: any[] = [];
  const fwJson = await safeFetchJson(
    "https://findwork.dev/api/jobs/?remote=true"
  );

  if (fwJson && Array.isArray(fwJson.results)) {
    findwork = fwJson.results.map((job: any) => ({
      title: job.role || "",
      company: job.company_name || "",
      description: cleanHtml(job.text || ""),
      location: job.location || "Remote",
      link: job.url || job.apply_url || "",
      source: "FindWork",
    }));
  }

  /* ---------- 4) RemoteOK API ---------- */
  let remoteok: any[] = [];
  const roJson = await safeFetchJson("https://remoteok.com/api");

  if (Array.isArray(roJson)) {
    for (const r of roJson) {
      if (!r || !r.position) continue;

      remoteok.push({
        title: r.position || r.title || "",
        company: r.company || "",
        description: cleanHtml(r.description || r.tags?.join(" ") || ""),
        location: r.location || r.country || (r.remote ? "Remote" : ""),
        link: r.url || r.url_ro || `https://remoteok.com/remote-jobs/${r.id}`,
        source: "RemoteOK",
      });
    }
  }

  /* ---------- 5) WeWorkRemotely ---------- */
  const wwrXml = await safeFetchText(
    "https://weworkremotely.com/remote-jobs.rss"
  );
  const wwr = parseRSSItems(wwrXml).map((j) => ({
    ...j,
    source: "WeWorkRemotely",
  }));

  /* ---------- 6) ZimboJobs ---------- */
  const zimbojobs = await fetchZimboJobs();

  /* ---------- MERGE + CLEAN ---------- */
  let all = [
    ...jobicy,
    ...workAnywhere,
    ...findwork,
    ...remoteok,
    ...wwr,
    ...zimbojobs,
  ].map(normalize);

  all = dedupe(all);

  /* ---------- Keyword Filtering ---------- */
  if (keywords.length > 0) {
    const kw = keywords.map((k) => k.toLowerCase());

    all = all.filter((job) =>
      kw.some((k) =>
        (job.title + " " + job.company + " " + job.description)
          .toLowerCase()
          .includes(k)
      )
    );
  }

  /* ---------- Country / City Filtering ---------- */
  const filtered = country
    ? all.filter((job) =>
        (job.location || "remote").toLowerCase().includes(country)
      )
    : all;

  /* ---------- Final Output ---------- */
  return NextResponse.json(filtered.slice(0, 200));
}
