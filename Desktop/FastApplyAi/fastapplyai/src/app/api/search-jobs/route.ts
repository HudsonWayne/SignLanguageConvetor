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

/* ====================== ZIMBAJOB ====================== */
async function fetchZimbaJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const base = "https://www.zimbajob.com";

  const html = await safeFetch(
    "https://www.zimbajob.com/job-vacancies-search-zimbabwe"
  );
  if (!html) return jobs;

  const $ = load(html);

  $("a.job-title").each((_, el) => {
    const title = clean($(el).text());
    const href = $(el).attr("href");
    if (!title || !href) return;

    const card = $(el).closest(".job-listing");

    const company =
      clean(card.find(".company-name").text()) || "Unknown Company";

    const location =
      clean(card.find(".job-location").text()) || "Zimbabwe";

    const description =
      clean(card.find(".job-description").text()) ||
      "See full description on employer site.";

    jobs.push({
      title,
      company,
      location,
      description,
      skills: [],
      link: href.startsWith("http") ? href : `${base}${href}`,
      source: "ZimbaJob",
      remote: location.toLowerCase().includes("remote"),
      city: normalizeCity(location),
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
  const keywords: string[] = body.keywords || [];

  const [zimba, remotive, arbeitnow] = await Promise.all([
    withTimeout(fetchZimbaJobs(), 8000).catch(() => [] as Job[]),
    withTimeout(fetchRemotiveJobs(keywords), 8000).catch(() => [] as Job[]),
    withTimeout(fetchArbeitnowJobs(keywords), 8000).catch(() => [] as Job[]),
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
      jobs = jobs.filter((j) => (j.city || normalizeCity(j.location)) === target);
    }
  }

  /* REMOTE FILTER */
  if (remoteOnly) {
    jobs = jobs.filter(
      (j) => Boolean(j.remote) || j.location.toLowerCase().includes("remote")
    );
  }

  /* MATCH SCORE */
  jobs = jobs.map((j) => {
    let score = 20; // base score

    const text = `${j.title} ${j.description}`.toLowerCase();

    keywords.forEach((k) => {
      if (text.includes(k.toLowerCase())) score += 10;
    });

    if (Boolean(j.remote) || j.location.toLowerCase().includes("remote"))
      score += 15;
    if (score > 100) score = 100;

    return { ...j, match: score };
  });

  jobs.sort((a, b) => (b.match || 0) - (a.match || 0));

  return NextResponse.json(jobs.slice(0, 50));
}