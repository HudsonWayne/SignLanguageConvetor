import { NextResponse } from "next/server";
import { load } from "cheerio";

/* ========================== TYPES ========================== */
interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  link: string;
  source: string;
  match?: number;
  remote?: boolean;
  city?: string;
  country?: string;
  postedAt?: string;
  matchedSkills?: string[];
}

/* ========================== HELPERS ========================== */
const clean = (t = "") => t.replace(/\s+/g, " ").trim();

function normalizeCity(input = "") {
  const c = clean(input).toLowerCase();
  if (!c) return "";

  // normalize common Zimbabwe cities
  const map: Record<string, string> = {
    harare: "Harare",
    bulawayo: "Bulawayo",
    "mutare": "Mutare",
    "gweru": "Gweru",
    "kwekwe": "Kwekwe",
    "masvingo": "Masvingo",
    "chinhoyi": "Chinhoyi",
    "kadoma": "Kadoma",
    "bindura": "Bindura",
    "victoria falls": "Victoria Falls",
  };
  for (const key of Object.keys(map)) {
    if (c.includes(key)) return map[key];
  }
  return "";
}

function inferCityFromText(...parts: Array<string | undefined | null>) {
  const combined = clean(parts.filter(Boolean).join(" "));
  return normalizeCity(combined);
}

function safeDateIso(input?: string) {
  if (!input) return undefined;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function hoursSince(iso?: string) {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / (1000 * 60 * 60);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      },
      cache: "no-store",
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizeSkill(s: string) {
  return clean(s).toLowerCase();
}

function uniqueNormalizedSkills(keywords: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of keywords || []) {
    const k = normalizeSkill(raw);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function getSkillHits(job: Job, keywords: string[]) {
  const text = `${job.title} ${job.description} ${(job.skills || []).join(" ")}`.toLowerCase();
  const hits: string[] = [];
  for (const raw of keywords) {
    const k = normalizeSkill(raw);
    if (!k) continue;
    if (text.includes(k)) hits.push(raw);
  }
  // de-dupe case-insensitively while keeping original label
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of hits) {
    const key = normalizeSkill(h);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

/* ====================== ZIMBAJOB ====================== */
async function fetchZimbaJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const base = "https://www.zimbajob.com";

  const html = await safeFetch(
    "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
  );
  if (!html) return jobs;

  const $ = load(html);

  // ZimbaJob markup varies; use multiple selectors and fallbacks.
  const titleAnchors = $("a.job-title");
  const anchors = titleAnchors.length ? titleAnchors : $("a[href*='/job-vacancies-zimbabwe/']");

  anchors.each((_, el) => {
    const $el = $(el);
    const title = clean($el.text());
    const href = $el.attr("href");
    if (!title || !href) return;

    const card = $el.closest(".job-listing");

    const company =
      clean(card.find(".company-name").text()) ||
      clean(card.find("a[href*='/recruiter/']").first().text()) ||
      "Unknown Company";

    const locationText =
      clean(card.find(".job-location").text()) ||
      clean(card.text());

    const description =
      clean(card.find(".job-description").text()) ||
      "See full description on employer site.";

    const inferredCity = inferCityFromText(title, locationText);
    const location = inferredCity ? `${inferredCity}, Zimbabwe` : "Zimbabwe";

    jobs.push({
      title,
      company,
      location,
      description,
      skills: [],
      link: href.startsWith("http") ? href : `${base}${href}`,
      source: "ZimbaJob",
      remote:
        title.toLowerCase().includes("remote") || locationText.toLowerCase().includes("remote"),
      city: inferredCity,
      country: "Zimbabwe",
    });
  });

  return jobs;
}

/* ====================== REMOTIVE (REMOTE) ====================== */
type RemotiveJob = {
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  url: string;
  publication_date: string;
  candidate_required_location: string;
  description: string;
};

async function fetchRemotiveJobs(keywords: string[]): Promise<Job[]> {
  const query = encodeURIComponent((keywords || []).slice(0, 5).join(" "));
  const url = query
    ? `https://remotive.com/api/remote-jobs?search=${query}`
    : `https://remotive.com/api/remote-jobs`;

  const json = await safeFetchJson<{ jobs: RemotiveJob[] }>(url);
  if (!json?.jobs) return [];

  return json.jobs.slice(0, 50).map((j) => {
    const location = clean(j.candidate_required_location || "Remote");
    return {
      title: clean(j.title),
      company: clean(j.company_name) || "Unknown Company",
      location: location || "Remote",
      description: clean(j.description || ""),
      skills: [],
      link: j.url,
      source: "Remotive",
      remote: true,
      city: "",
      country: "Remote",
      postedAt: safeDateIso(j.publication_date),
    };
  });
}

/* ====================== ARBEITNOW (REMOTE) ====================== */
type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  location: string;
  tags: string[];
};

async function fetchArbeitnowJobs(keywords: string[]): Promise<Job[]> {
  // Arbeitnow does not support keyword search; we'll fetch then rank using match.
  const json = await safeFetchJson<{ data: ArbeitnowJob[] }>(
    "https://www.arbeitnow.com/api/job-board-api"
  );
  const data = json?.data;
  if (!data) return [];

  return data.slice(0, 50).map((j) => {
    const location = clean(j.location || (j.remote ? "Remote" : ""));
    return {
      title: clean(j.title),
      company: clean(j.company_name) || "Unknown Company",
      location: location || (j.remote ? "Remote" : ""),
      description: clean(j.description || ""),
      skills: (j.tags || []).slice(0, 10),
      link: j.url,
      source: "Arbeitnow",
      remote: Boolean(j.remote) || location.toLowerCase().includes("remote"),
      city: "",
      country: j.remote ? "Remote" : "",
    };
  });
}

function dedupeJobs(jobs: Job[]) {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const j of jobs) {
    const key = (j.link || "").trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

/* ============================ API ============================ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const country = (body.country || "").toLowerCase();
  const city = (body.city || "").toLowerCase();
  const remoteOnly = Boolean(body.remoteOnly);
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];
  const normalizedKeywords = uniqueNormalizedSkills(keywords);
  // keep strict matching realistic: very long skill lists will almost always produce 0 results
  const effectiveKeywords = normalizedKeywords.slice(0, 20);
  const minPostedDaysRaw = body.minPostedDays;
  const minPostedDays =
    typeof minPostedDaysRaw === "number" && Number.isFinite(minPostedDaysRaw)
      ? minPostedDaysRaw
      : null;
  const minMatchRaw = body.minMatch;
  const minMatch =
    typeof minMatchRaw === "number" && Number.isFinite(minMatchRaw)
      ? Math.max(0, Math.min(100, minMatchRaw))
      : null;
  const requireAllSkills = Boolean(body.requireAllSkills);
  const failOpen = body.failOpen !== false;

  const [zimba, remotive, arbeitnow] = await Promise.all([
    withTimeout(fetchZimbaJobs(), 8000).catch(() => [] as Job[]),
    withTimeout(fetchRemotiveJobs(effectiveKeywords), 8000).catch(() => [] as Job[]),
    withTimeout(fetchArbeitnowJobs(effectiveKeywords), 8000).catch(() => [] as Job[]),
  ]);

  let jobs = dedupeJobs([...zimba, ...remotive, ...arbeitnow]);

  /* COUNTRY FILTER (SOFT) */
  // Only apply a hard country filter when the country looks like Zimbabwe,
  // otherwise keep all jobs so the frontend can apply its own filters.
  if (country && (country.includes("zim") || country.includes("zimbabwe"))) {
    jobs = jobs.filter(
      (j) =>
        j.location.toLowerCase().includes("zim") ||
        j.location.toLowerCase().includes("zimbabwe")
    );
  }

  /* CITY FILTER (ZIMBABWE) */
  if (city) {
    const target = normalizeCity(city);
    if (target) {
      jobs = jobs.filter(
        (j) => inferCityFromText(j.city, j.location, j.title) === target
      );
    }
  }

  /* REMOTE FILTER */
  if (remoteOnly) {
    jobs = jobs.filter(
      (j) => Boolean(j.remote) || j.location.toLowerCase().includes("remote")
    );
  }

  /* RECENCY FILTER */
  if (minPostedDays !== null) {
    const maxHours = minPostedDays * 24;
    jobs = jobs.filter((j) => hoursSince(j.postedAt) <= maxHours);
  }

  /* MATCH SCORE */
  jobs = jobs.map((j) => {
    const matchedSkills = getSkillHits(j, effectiveKeywords);
    const total = effectiveKeywords.map(normalizeSkill).filter(Boolean);
    const denom = total.length || 1;
    const percent = Math.round((matchedSkills.length / denom) * 100);

    let score = percent;

    // small boosts for UX ordering
    if (Boolean(j.remote) || j.location.toLowerCase().includes("remote")) score += 5;
    if (score > 100) score = 100;

    return { ...j, match: score, matchedSkills };
  });

  /* STRICT MATCH FILTERS */
  if (effectiveKeywords.length > 0) {
    const beforeStrict = jobs;
    if (requireAllSkills) {
      jobs = jobs.filter((j) => {
        const have = uniqueNormalizedSkills(j.matchedSkills || []);
        const want = effectiveKeywords;
        return want.every((k) => have.includes(k));
      });
    }
    if (minMatch !== null) {
      jobs = jobs.filter((j) => (j.match || 0) >= minMatch);
    }

    // If strict filters removed everything, fall back to showing scored jobs.
    // This prevents the UI from looking broken while still ranking by match.
    if (failOpen && jobs.length === 0) {
      jobs = beforeStrict;
    }
  }

  jobs.sort((a, b) => {
    const aLocal = (a.country || "").toLowerCase().includes("zimbabwe") || a.source === "ZimbaJob";
    const bLocal = (b.country || "").toLowerCase().includes("zimbabwe") || b.source === "ZimbaJob";
    if (aLocal !== bLocal) return aLocal ? -1 : 1;
    const matchDiff = (b.match || 0) - (a.match || 0);
    if (matchDiff !== 0) return matchDiff;
    return hoursSince(a.postedAt) - hoursSince(b.postedAt);
  });

  return NextResponse.json(jobs.slice(0, 50));
}