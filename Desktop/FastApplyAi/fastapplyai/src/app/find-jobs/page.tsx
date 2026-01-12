"use client";
import Link from "next/link";
import { FiUpload, FiSearch, FiBell, FiUser, FiMenu, FiX, FiMapPin } from "react-icons/fi";
import { useEffect, useState } from "react";

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  remote?: boolean;
  match?: number;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "local" | "remote">("all");
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("skills");
    if (stored) setSkills(JSON.parse(stored));
    const saved = localStorage.getItem("savedJobs");
    if (saved) setSavedJobs(JSON.parse(saved));
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) { setSkillInput(""); return; }
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
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, keywords: skills }),
      });
      const data = await res.json();
      setJobs(data || []);
    } catch (e) { console.error(e); setJobs([]); }
    setLoading(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const loc = job.location.toLowerCase();
    if (filter === "local") return loc.includes(country.toLowerCase());
    if (filter === "remote") return loc.includes("remote");
    return true;
  });

  const autoApply = (job: Job) => window.open(job.link, "_blank");
  const saveJob = (job: Job) => { const next = [...savedJobs, job]; setSavedJobs(next); localStorage.setItem("savedJobs", JSON.stringify(next)); };

  if (!mounted) return <div className="min-h-screen bg-slate-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200 font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 font-extrabold text-xl">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl px-3 py-1 shadow-md">QA</div>
            <span className="tracking-tight">QuickApplyAI</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-gray-700 font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"><FiUser /> Dashboard</Link>
            <Link href="/upload-cv" className="flex items-center gap-2 hover:text-green-600 transition"><FiUpload /> Upload CV</Link>
            <Link href="/find-jobs" className="flex items-center gap-2 text-green-600 font-semibold"><FiSearch /> Find Jobs</Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl text-gray-700">{mobileMenu ? <FiX /> : <FiMenu />}</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="text-center mt-16 mb-10 px-4">
        <h1 className="text-4xl font-black text-gray-900">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-5 text-lg max-w-2xl mx-auto">We match real opportunities using your CV skills and preferences.</p>
      </header>

      {/* FILTERS & SKILLS */}
      <section className="px-4 sm:px-6 lg:px-20 mb-10">
        <div className="max-w-5xl mx-auto bg-white/80 p-6 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-700 flex items-center gap-2 mb-2 font-semibold"><FiMapPin /> Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Zimbabwe, South Africa, Remote" className="p-3 border rounded-2xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Filter Jobs</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter("all")} className={`px-3 py-2 rounded-xl ${filter === "all" ? "bg-green-600 text-white" : "bg-gray-200"}`}>All</button>
              <button onClick={() => setFilter("local")} className={`px-3 py-2 rounded-xl ${filter === "local" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Local</button>
              <button onClick={() => setFilter("remote")} className={`px-3 py-2 rounded-xl ${filter === "remote" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Remote</button>
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={fetchJobs} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform">Apply Filters</button>
          </div>
        </div>

        {/* Skills Input */}
        <div className="max-w-5xl mx-auto mt-6 bg-white/80 p-4 rounded-3xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Add a skill — e.g. React" className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            <button onClick={addSkill} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Add Skill</button>
            <button onClick={() => { localStorage.removeItem("skills"); setSkills([]); }} className="text-sm text-gray-500 hover:text-gray-700 transition">Clear</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map(s => <div key={s} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 font-semibold">{s} <button onClick={() => removeSkill(s)} className="text-xs text-red-500">✕</button></div>)}
          </div>
        </div>
      </section>

      {/* JOB RESULTS */}
      <main className="px-4 sm:px-6 lg:px-20 pb-24">
        {loading ? <p className="text-center animate-pulse">Loading jobs...</p> :
          filteredJobs.length === 0 ? <p className="text-center">No jobs found.</p> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl shadow-xl flex flex-col justify-between">
                  <div>
                    <a href={job.link} target="_blank" rel="noreferrer">
                      <h2 className="text-xl font-bold hover:text-green-600">{job.title}</h2>
                    </a>
                    <p className="text-gray-600 mt-1 font-medium">{job.company}</p>
                    <p className="text-gray-500 mt-1 text-sm">{job.location}</p>
                    <p className="text-gray-700 mt-2 text-sm">{job.description?.substring(0, 180)}...</p>
                    <p className="text-xs text-gray-400 mt-1">Source: {job.source}</p>
                    {job.match !== undefined && <span className="text-sm font-semibold text-blue-600 mt-1">Match: {job.match}%</span>}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => autoApply(job)} className="flex-1 bg-green-600 text-white p-3 rounded-2xl font-bold">Auto Apply 🤖</button>
                    <button onClick={() => saveJob(job)} className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-2xl font-bold">Save</button>
                  </div>
                </div>
              ))}
            </div>
        }
      </main>
    </div>
  );
}
