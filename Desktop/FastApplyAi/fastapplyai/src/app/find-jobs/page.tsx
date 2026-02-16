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
        if (city) {
          results = await doRequest({ ...basePayload, city: "" });
          if (results.length > 0) {
            setSearchNote("No matches in selected city — showing Zimbabwe-wide matches.");
            setLastEffectiveMinMatch(typeof basePayload.minMatch === "number" ? basePayload.minMatch : minMatch);
          }
        }
      }

      if (cvAlignedOnly && results.length === 0) {
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

  // ✅ HELPER: clean HTML from job description
  const cleanJobDescription = (html?: string) => {
    if (!html) return "";
    const temp = html.replace(/<[^>]+>/g, " ");
    return temp.replace(/\s+/g, " ").trim();
  };

  if (!mounted) return <div className="min-h-screen bg-slate-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200 font-sans">
      {/* NAV, MOBILE MENU, HEADER, FILTERS ... same as before */}

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
                  <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                    {cleanJobDescription(job.description).substring(0, 180)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Source: {job.source}</p>
                  {job.postedAt && <p className="text-xs text-gray-400 mt-1">Posted: {formatAge(job.postedAt)}</p>}

                  {matchedSkillsForJob(job).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchedSkillsForJob(job).slice(0, 6).map((s) => (
                        <span key={s} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{s}</span>
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

                <button onClick={() => applyJob(job)} className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition">Apply 🤖</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
