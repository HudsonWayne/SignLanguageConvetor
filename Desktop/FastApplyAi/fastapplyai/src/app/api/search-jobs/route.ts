// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import cheerio from "cheerio";

/**
 * Note:
 * - Install cheerio: npm install cheerio
 * - This route scrapes multiple public job sites + uses Remotive API as extra source.
 * - Scrapers are best-effort and may need small selector adjustments if sites change.
 * - Keep rate limits and legal site terms in mind when deploying at scale.
 */

// --- Helpers: safe fetch with headers
async function safeFetch(url: string, opts: RequestInit = {}) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    ...((opts && opts.headers) || {}),
  };
  return fetch(url, { ...opts, headers });
}

// --- Utility: text normalizer
function txt(s: any) {
  return (s || "").toString().trim().replace(/\s+/g, " ");
}

// --- Scraper: CVPeople Africa (cvpeopleafrica.com/jobs)
async function scrapeCvPeople(query: string) {
  try {
    const url = `https://www.cvpeopleafrica.com/jobs?q=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    // Inspect page for job cards - this is best effort; update selectors if site changes
    $(".text-dark .job-card, .job-card, .job-listing, li.job").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h4, h3, .job-title, .job-listing-title").first().text()) ||
        txt(el$.find("a").first().text());
      const company =
        txt(el$.find(".company, .employer, .company-name").first().text()) ||
        "";
      let link = el$.find("a").first().attr("href") || "";
      if (link && !link.startsWith("http")) {
        link = "https://www.cvpeopleafrica.com" + link;
      }
      const location =
        txt(el$.find(".location, .job-location, .job-meta").first().text()) ||
        "Zimbabwe";
      const desc = txt(
        el$.find(".description, .job-desc, .summary, p").first().text()
      );

      if (title) {
        results.push({
          id: `cvp-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "CVPeople",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("CVPeople scrape error:", err);
    return [];
  }
}

// --- Scraper: JobsZimbabwe (jobszimbabwe.co.zw)
async function scrapeJobsZimbabwe(query: string) {
  try {
    // Example search: site supports keywords in query param? We'll just use homepage search parameter if available
    const url = `https://jobszimbabwe.co.zw/?s=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    $(".job, .job-item, .listing").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h2, h3, .title, a").first().text()) ||
        txt(el$.find("a").first().text());
      const link = el$.find("a").first().attr("href") || "";
      const company = txt(el$.find(".company, .employer").first().text()) || "";
      const location =
        txt(el$.find(".location, .job-location").first().text()) || "Zimbabwe";
      const desc = txt(el$.find(".excerpt, .summary, p").first().text());

      if (title) {
        results.push({
          id: `jz-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "JobsZimbabwe",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("JobsZimbabwe scrape error:", err);
    return [];
  }
}

// --- Scraper: Pindula Jobs (jobs.pindula.co.zw)
async function scrapePindula(query: string) {
  try {
    const url = `https://jobs.pindula.co.zw/?s=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: any[] = [];
    $(".job, article, .job-item, .post").each((i, el) => {
      const el$ = $(el);
      const title =
        txt(el$.find("h2, a, .title").first().text()) ||
        txt(el$.find("a").first().text());
      const link = el$.find("a").first().attr("href") || "";
      const company = txt(el$.find(".company, .meta .company").first().text()) || "";
      const location = txt(el$.find(".location, .meta .location").first().text()) || "Zimbabwe";
      const desc = txt(el$.find(".entry-summary, p").first().text());

      if (title) {
        results.push({
          id: `pind-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "Pindula",
          datePosted: null,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("Pindula scrape error:", err);
    return [];
  }
}

// --- Scraper: Indeed Zimbabwe (best-effort / may be blocked)
// We'll do a simple query to Indeed's job search page and try to parse job cards.
// If blocked or structure differs, return [] gracefully.
async function scrapeIndeedZimbabwe(query: string) {
  try {
    const url = `https://zw.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Zimbabwe`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    // Indeed uses multiple card classes — attempt to capture common ones
    $('[data-testid="jobTitle"]').each((i, el) => {
      const parent = $(el).closest("a");
      const title = txt($(el).text());
      const linkRel = parent.attr("href") || "";
      let link = linkRel;
      if (link && !link.startsWith("http")) {
        link = "https://zw.indeed.com" + link;
      }
      const company = txt(parent.closest(".job_seen_beacon").find(".companyName").text());
      const location = txt(parent.closest(".job_seen_beacon").find(".companyLocation").text()) || "Zimbabwe";
      const desc = txt(parent.closest(".job_seen_beacon").find(".job-snippet").text());

      if (title) {
        results.push({
          id: `indeed-${i}-${Date.now()}`,
          title,
          company,
          description: desc || title,
          location,
          url: link,
          salary: "Not provided",
          source: "Indeed",
          datePosted: null,
        });
      }
    });

    // fallback: older selectors
    if (results.length === 0) {
      $(".result, .jobsearch-SerpJobCard").each((i, el) => {
        const el$ = $(el);
        const title = txt(el$.find("h2 a, a.jobtitle").text());
        let link = el$.find("h2 a, a.jobtitle").attr("href") || "";
        if (link && !link.startsWith("http")) link = "https://zw.indeed.com" + link;
        const company = txt(el$.find(".company").text());
        const location = txt(el$.find(".location").text()) || "Zimbabwe";
        const desc = txt(el$.find(".summary").text());
        if (title) {
          results.push({
            id: `indeed2-${i}-${Date.now()}`,
            title,
            company,
            description: desc || title,
            location,
            url: link,
            salary: "Not provided",
            source: "Indeed",
            datePosted: null,
          });
        }
      });
    }

    return results;
  } catch (err) {
    console.error("Indeed scrape error:", err);
    return [];
  }
}

// --- Remotive: remote jobs API (no key required)
async function fetchRemotive(query: string) {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const jobs = (json.jobs || []).map((j: any) => ({
      id: `rem-${j.id}`,
      title: txt(j.title),
      company: txt(j.company_name || j.company),
      description: txt(j.description).slice(0, 400),
      location: txt(j.candidate_required_location || "Remote"),
      url: j.url,
      salary: j.salary || "Not provided",
      source: "Remotive",
      datePosted: j.publication_date || null,
    }));
    return jobs;
  } catch (err) {
    console.error("Remotive error:", err);
    return [];
  }
}

// --- Utility: simple match scoring
function computeMatchPercent(skills: string[], text: string) {
  if (!skills || skills.length === 0) return 0;
  const lower = (text || "").toLowerCase();
  let count = 0;
  for (const s of skills) {
    if (!s) continue;
    if (lower.includes(s.toLowerCase())) count++;
  }
  // base score: if nothing matched, give small baseline
  const percent = Math.round((count / skills.length) * 100);
  return percent || 10;
}

// --- Route handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills: string[] = body.skills || [];
    const country: string = body.country || "";
    const minSalary = body.minSalary ? Number(body.minSalary) : null;
    const page = Number(body.page || 1);

    // If no skills, return early
    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const query = skills.slice(0, 6).join(" ");

    // Run scrapers in parallel (best-effort)
    const [
      cvPeopleList,
      jobsZimList,
      pindulaList,
      indeedList,
      remotiveList,
    ] = await Promise.allSettled([
      scrapeCvPeople(query),
      scrapeJobsZimbabwe(query),
      scrapePindula(query),
      scrapeIndeedZimbabwe(query),
      fetchRemotive(query),
    ]);

    // Helper to extract value from PromiseSettledResult
    const unpack = (r: PromiseSettledResult<any>) =>
      r.status === "fulfilled" ? r.value || [] : [];

    let results: any[] = [
      ...unpack(cvPeopleList),
      ...unpack(jobsZimList),
      ...unpack(pindulaList),
      ...unpack(indeedList),
      ...unpack(remotiveList),
    ];

    // Normalize: ensure unique by url or title+company
    const seen = new Set<string>();
    results = results.filter((job) => {
      const key = (job.url || job.title + "|" + job.company).toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by country if provided (loose contains)
    if (country) {
      const cLower = country.toLowerCase();
      results = results.filter((job) =>
        (job.location || "").toLowerCase().includes(cLower)
      );
    }

    // Filter by minSalary if provided (best-effort)
    if (minSalary && minSalary > 0) {
      results = results.filter((job) => {
        if (!job.salary || job.salary === "Not provided") return false;
        // Extract numbers from salary (basic)
        const nums = job.salary.replace(/[, ]+/g, "").match(/\d+/g);
        if (!nums || nums.length === 0) return false;
        const n = Number(nums[0]);
        return !isNaN(n) && n >= minSalary;
      });
    }

    // Filter by recency: keep jobs with a posted date within 7 days if available,
    // otherwise keep (we can't be sure). We'll prefer ones that do have dates.
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Partition: those with datePosted and those without
    const withDate = results.filter((r) => r.datePosted);
    const withoutDate = results.filter((r) => !r.datePosted);

    const recentWithDate = withDate.filter((r) => {
      const d = new Date(r.datePosted).getTime();
      return !isNaN(d) && now - d <= SEVEN_DAYS_MS;
    });

    // Keep recent with date + some withoutDate (because many local postings don't include date)
    results = [...recentWithDate, ...withoutDate];

    // Score results by match percent and simple heuristics (source priority)
    results = results.map((job) => {
      const matchPercent = computeMatchPercent(skills, `${job.title} ${job.description} ${job.company}`);
      const freshnessScore = job.datePosted
        ? Math.max(0, Math.round(100 - (now - new Date(job.datePosted).getTime()) / (SEVEN_DAYS_MS / 100)))
        : 50;
      // base score combine
      const score = Math.round(matchPercent * 0.7 + freshnessScore * 0.3);
      return { ...job, matchPercent, _score: score };
    });

    // Sort by _score desc
    results.sort((a, b) => (b._score || 0) - (a._score || 0));

    // Pagination
    const perPage = 10;
    const start = (page - 1) * perPage;
    const pageJobs = results.slice(start, start + perPage);

    // Return trimmed job objects (no huge html)
    const payload = pageJobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      description: j.description,
      url: j.url,
      salary: j.salary,
      matchPercent: j.matchPercent,
      source: j.source,
    }));

    return NextResponse.json({ jobs: payload });
  } catch (err) {
    console.error("search-jobs route error:", err);
    return NextResponse.json({ jobs: [] });
  }
}
