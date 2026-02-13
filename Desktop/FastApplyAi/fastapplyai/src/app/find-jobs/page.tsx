"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiSearch,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
} from "react-icons/fi";

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  remote?: boolean;
  skills?: string[];
  match?: number;
  postedAt?: string;
  matchedSkills?: string[];
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "local" | "remote">("all");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [recency, setRecency] = useState<"any" | "1" | "7" | "30">("any");
  const [minMatch, setMinMatch] = useState(70);
  const [requireAllSkills, setRequireAllSkills] = useState(false);
  const [cvAlignedOnly, setCvAlignedOnly] = useState(true);
  const [searchNote, setSearchNote] = useState<string>("");
  const [lastEffectiveMinMatch, setLastEffectiveMinMatch] = useState<number>(minMatch);

  // Applicant info (mock)
  const user = {
    fullName: "Wayne Benhura",
    email: "wayne@email.com",
    phone: "+263771000000",
    resumeUrl: "/resume.pdf",
  };

  useEffect(() => {
    setMounted(true);
    const storedSkills = localStorage.getItem("skills");
    const applied = localStorage.getItem("appliedJobs");
    if (storedSkills) {
      try { setSkills(JSON.parse(storedSkills)); } catch {}
    }
    if (applied) {
      try { setAppliedJobs(JSON.parse(applied)); } catch {}
    }
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) {
      setSkillInput("");
      return;
    }
    const next = [...skills, s];
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    const next = skills.filter(k => k !== s);
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const doRequest = async (payload: any) => {
        const res = await fetch("/api/search-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        return Array.isArray(data) ? (data as Job[]) : [];
      };

      const basePayload = {
        country,
        city,
        remoteOnly: filter === "remote" || remoteOnly,
        keywords: skills,
        minPostedDays: recency === "any" ? null : Number(recency),
        minMatch: skills.length ? (cvAlignedOnly ? Math.max(10, minMatch) : minMatch) : null,
        requireAllSkills: skills.length ? requireAllSkills : false,
        failOpen: !cvAlignedOnly,
      };

      setSearchNote("");
      setLastEffectiveMinMatch(typeof basePayload.minMatch === "number" ? basePayload.minMatch : minMatch);
      let results = await doRequest(basePayload);

      if (cvAlignedOnly && results.length === 0) {
        // 1) relax city (city pages often have few tech postings)
        if (city) {
          results = await doRequest({ ...basePayload, city: "" });
          if (results.length > 0) {
            setSearchNote("No matches in selected city — showing Zimbabwe-wide matches.");
            setLastEffectiveMinMatch(typeof basePayload.minMatch === "number" ? basePayload.minMatch : minMatch);
          }
        }
      }

      if (cvAlignedOnly && results.length === 0) {
        // 2) relax match threshold
        const currentMin = typeof basePayload.minMatch === "number" ? basePayload.minMatch : null;
        if (currentMin !== null && currentMin > 30) {
          results = await doRequest({ ...basePayload, city: "", minMatch: 30 });
          if (results.length > 0) {
            setSearchNote("No matches at your threshold — lowered Minimum match to 30%.");
            setLastEffectiveMinMatch(30);
          }
        }
      }

      if (cvAlignedOnly && results.length === 0) {
        const currentMin = typeof basePayload.minMatch === "number" ? basePayload.minMatch : null;
        if (currentMin !== null && currentMin > 10) {
          results = await doRequest({ ...basePayload, city: "", minMatch: 10 });
          if (results.length > 0) {
            setSearchNote("Still too strict — lowered Minimum match to 10%.");
            setLastEffectiveMinMatch(10);
          }
        }
      }

      if (cvAlignedOnly && results.length === 0) {
        setSearchNote(
          "No CV-aligned jobs were found from the sources right now. Try lowering Minimum match to 10–30%, remove the city filter, or temporarily disable CV-aligned only."
        );
      }

      setJobs(results);
    } catch (e) {
      console.error("fetchJobs error", e);
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => { if (mounted) fetchJobs(); }, [mounted]);

  const filteredJobs = jobs.filter((job) => {
    const loc = (job.location || "").toLowerCase();
    const effectiveUiMin = cvAlignedOnly ? Math.max(10, lastEffectiveMinMatch) : 0;
    if (cvAlignedOnly && (job.match || 0) < effectiveUiMin) return false;
    if (filter === "local") {
      if (!country.trim()) return true;
      return loc.includes(country.toLowerCase()) || loc.includes("zimbabwe");
    }
    if (filter === "remote") return Boolean(job.remote) || loc.includes("remote");
    return true;
  });

  const applyJob = (job: Job) => {
    window.open(job.link, "_blank");
    if (!appliedJobs.includes(job.link)) {
      const next = [...appliedJobs, job.link];
      setAppliedJobs(next);
      localStorage.setItem("appliedJobs", JSON.stringify(next));
    }
  };

  const openLinkedInSearch = () => {
    const query = skills.length ? skills.join(" ") : "jobs";
    const location = city || country || "Zimbabwe";
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
      query
    )}&location=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  const hoursSince = (iso?: string) => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return null;
    return (Date.now() - t) / (1000 * 60 * 60);
  };

  const formatAge = (iso?: string) => {
    const h = hoursSince(iso);
    if (h === null) return "";
    if (h < 24) return `${Math.round(h)}h ago`;
    const d = h / 24;
    return `${Math.round(d)}d ago`;
  };

  const matchedSkillsForJob = (job: Job) => {
    if (Array.isArray(job.matchedSkills) && job.matchedSkills.length > 0) {
      return job.matchedSkills;
    }
    const text = `${job.title} ${job.description}`.toLowerCase();
    return skills
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => text.includes(s.toLowerCase()));
  };

  if (!mounted) return <div className="min-h-screen bg-slate-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200 font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 font-extrabold text-xl">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl px-3 py-1 shadow-md">
              QA
            </div>
            <span className="tracking-tight">QuickApplyAI</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-gray-700 font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition">
              <FiUser /> Dashboard
            </Link>
            <Link href="/upload-cv" className="flex items-center gap-2 hover:text-green-600 transition">
              <FiUpload /> Upload CV
            </Link>
            <Link href="/find-jobs" className="flex items-center gap-2 text-green-600 font-semibold">
              <FiSearch /> Find Jobs
            </Link>
            <Link href="/applied" className="hover:text-green-600 transition">Applied Jobs</Link>
            <Link href="/notifications" className="flex items-center gap-2 hover:text-green-600 transition">
              <FiBell /> Notifications
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl text-gray-700">
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b shadow-lg p-5 space-y-3">
          {[["Dashboard", "/dashboard"], ["Upload CV", "/upload-cv"], ["Find Jobs", "/find-jobs"], ["Applied Jobs", "/applied"], ["Notifications", "/notifications"]].map(([label, href]) => (
            <Link key={href} href={href} className="block px-4 py-3 rounded-xl hover:bg-green-100 transition font-medium">{label}</Link>
          ))}
        </div>
      )}

      {/* HEADER */}
      <header className="text-center mt-16 mb-10 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
          Find Matching Jobs
        </h1>
        <p className="text-gray-700 mt-5 text-lg sm:text-xl max-w-2xl mx-auto">
          We match real opportunities using your CV skills and preferences.
        </p>
      </header>

      {/* FILTERS */}
      <section className="px-4 sm:px-6 lg:px-20 mb-10">
        <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <label className="text-gray-700 flex items-center gap-2 mb-2 font-semibold">
              <FiMapPin /> Country
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Zimbabwe, South Africa, Remote"
              className="p-3 sm:p-4 border rounded-2xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 flex items-center gap-2 mb-2 font-semibold">
              City (Zimbabwe)
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-3 sm:p-4 border rounded-2xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
            >
              <option value="">All Cities</option>
              <option value="Harare">Harare</option>
              <option value="Bulawayo">Bulawayo</option>
              <option value="Mutare">Mutare</option>
              <option value="Gweru">Gweru</option>
              <option value="Kwekwe">Kwekwe</option>
              <option value="Masvingo">Masvingo</option>
              <option value="Chinhoyi">Chinhoyi</option>
              <option value="Kadoma">Kadoma</option>
              <option value="Bindura">Bindura</option>
              <option value="Victoria Falls">Victoria Falls</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Filter Jobs</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl ${
                  filter === "all" ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("local")}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl ${
                  filter === "local" ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                Local
              </button>
              <button
                onClick={() => setFilter("remote")}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl ${
                  filter === "remote" ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                Remote
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
              />
              Remote only
            </label>

            <label className="text-sm text-gray-700 font-medium">Recency</label>
            <select
              value={recency}
              onChange={(e) => setRecency(e.target.value as any)}
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
            >
              <option value="any">Any time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>

            <label className="text-sm text-gray-700 font-medium">Minimum match: {minMatch}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-full"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={cvAlignedOnly}
                onChange={(e) => setCvAlignedOnly(e.target.checked)}
              />
              CV-aligned only (recommended)
            </label>

            <p className="text-xs text-gray-500">
              If enabled, we hide low-match jobs and only show roles that mention your CV skills.
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={requireAllSkills}
                onChange={(e) => setRequireAllSkills(e.target.checked)}
              />
              Require all my skills
            </label>
          </div>

          <div className="flex items-end">
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={fetchJobs}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
              >
                Search Jobs
              </button>
              <button
                onClick={openLinkedInSearch}
                className="w-full bg-[#0A66C2] text-white p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:brightness-110 transition"
              >
                Search on LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="max-w-5xl mx-auto mt-6 sm:mt-8 bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill — e.g. React"
              className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <button onClick={addSkill} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Add Skill</button>
            <button onClick={() => { localStorage.removeItem("skills"); setSkills([]); }} className="text-sm text-gray-500 hover:text-gray-700 transition">Clear</button>
          </div>

          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
            {skills.length===0 ? <p className="text-sm text-gray-500">No skills loaded. Upload a CV or add skills manually.</p> : skills.map(s => (
              <div key={s} className="bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-2 font-semibold shadow-sm">
                {s} <button onClick={()=>removeSkill(s)} className="text-xs text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        </div>

        {searchNote && (
          <div className="max-w-5xl mx-auto mt-4 text-sm text-gray-700 bg-white/70 border border-white/60 rounded-2xl px-4 py-3">
            {searchNote}
          </div>
        )}
      </section>

      {/* JOB RESULTS */}
      <main className="px-4 sm:px-6 lg:px-20 pb-24">
        {loading ? (
          <p className="text-center text-lg sm:text-xl text-gray-700 animate-pulse">Loading jobs...</p>
        ) : filteredJobs.length===0 ? (
          <div className="text-center text-gray-700">
            <p className="text-lg sm:text-xl font-semibold">No jobs found for these filters.</p>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Tip: add fewer core skills (8-12), lower Minimum match to 10-30%, or disable CV-aligned only.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {filteredJobs.map((job, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-xl p-5 sm:p-7 rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <a href={job.link} target="_blank" rel="noreferrer">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-green-600 transition">{job.title}</h2>
                  </a>
                  <p className="text-gray-600 mt-1 font-medium">{job.company || "Unknown Company"}</p>
                  <p className="text-gray-500 mt-1 text-sm sm:text-base">{job.location}</p>
                  <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">{job.description?.substring(0, 180)}...</p>
                  <p className="text-xs text-gray-400 mt-2">Source: {job.source}</p>
                  {job.postedAt && (
                    <p className="text-xs text-gray-400 mt-1">Posted: {formatAge(job.postedAt)}</p>
                  )}

                  {matchedSkillsForJob(job).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchedSkillsForJob(job).slice(0, 6).map((s) => (
                        <span key={s} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.skills.map(skill => (
                        <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 items-center">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">{job.match || 0}% Match</span>
                  <button onClick={() => applyJob(job)} className="flex-1 bg-green-600 text-white p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition">Apply 🤖</button>
                  <button onClick={() => window.open(job.link, "_blank")} className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:bg-gray-300 transition">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
