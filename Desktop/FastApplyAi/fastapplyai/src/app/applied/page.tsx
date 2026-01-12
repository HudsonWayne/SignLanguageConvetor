"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiFileText,
  FiEye,
  FiTrendingUp,
  FiLogOut,
  FiUpload,
  FiSearch,
  FiBell,
  FiUser,
} from "react-icons/fi";

/* ===================== TYPES ===================== */
interface Job {
  title: string;
  company: string;
  location?: string;
  link?: string;
  source?: string;
  skills?: string[];
  match?: number;
  status?: "Applied" | "Viewed" | "Pending";
}

/* ===================== PAGE ===================== */
export default function AppliedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState("User");
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState<"all" | "viewed" | "pending">("all");

  /* ===================== INIT ===================== */
  useEffect(() => {
    // User
    const email = localStorage.getItem("email");
    if (email) setUser(email.split("@")[0]);

    // Screen
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Load jobs from API + localStorage
    const fetchApplied = async () => {
      let apiJobs: Job[] = [];
      try {
        const res = await fetch("/api/applied-jobs");
        apiJobs = (await res.json()).map((j: Job) => ({
          ...j,
          status: j.status || "Applied",
        }));
      } catch {}
      // Merge with localStorage
      const stored = localStorage.getItem("appliedJobsData");
      let localJobs: Job[] = [];
      if (stored) {
        try {
          localJobs = JSON.parse(stored);
        } catch {}
      }
      // Merge and remove duplicates (by link)
      const mergedJobs = [
        ...apiJobs,
        ...localJobs.filter((lj) => !apiJobs.some((aj) => aj.link === lj.link)),
      ];
      setJobs(mergedJobs);
    };

    fetchApplied();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===================== LOGOUT ===================== */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  /* ===================== STATS ===================== */
  const total = jobs.length;
  const viewed = jobs.filter((j) => j.status === "Viewed").length;
  const pending = jobs.filter((j) => j.status === "Pending").length;

  const filteredJobs = jobs.filter((j) => {
    if (filter === "viewed") return j.status === "Viewed";
    if (filter === "pending") return j.status === "Pending";
    return true;
  });

  /* ===================== REMOVE JOB ===================== */
  const removeJob = (link?: string) => {
    if (!link) return;
    const next = jobs.filter((j) => j.link !== link);
    setJobs(next);
    localStorage.setItem("appliedJobsData", JSON.stringify(next));
  };

  /* ===================== UI ===================== */
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 border-b">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
          QuickApplyAI
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center gap-1">
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="flex items-center gap-1">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1">
            <FiSearch /> Find Jobs
          </Link>
          <Link
            href="/applied"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md"
          >
            <FiFileText /> Applied Jobs
          </Link>
          <Link href="/notifications" className="flex items-center gap-1">
            <FiBell /> Notifications
          </Link>

          <span className="text-gray-600">
            Welcome, <b>{user}</b>
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Applied Jobs</h1>
        <p className="text-gray-700 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
          Track your job applications, see match %, skills, source, and status.
        </p>
      </header>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 px-4 sm:px-6 lg:px-20">
        <Stat icon={<FiFileText />} label="Total Applications" value={total} />
        <Stat icon={<FiEye />} label="Applications Viewed" value={viewed} />
        <Stat icon={<FiTrendingUp />} label="Pending Review" value={pending} />
      </div>

      {/* FILTERS */}
      <div className="flex justify-center gap-4 mb-12">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterBtn>
        <FilterBtn active={filter === "viewed"} onClick={() => setFilter("viewed")}>
          Viewed
        </FilterBtn>
        <FilterBtn active={filter === "pending"} onClick={() => setFilter("pending")}>
          Pending
        </FilterBtn>
      </div>

      {/* JOB LIST */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center col-span-full">
            <h2 className="text-2xl font-semibold mb-3">No Applications Yet</h2>
            <p className="text-gray-500 mb-8">Start applying to jobs to see them here.</p>
            <Link
              href="/find-jobs"
              className="bg-green-500 text-white px-10 py-3 rounded-full font-semibold"
            >
              Find Jobs
            </Link>
          </div>
        ) : (
          filteredJobs.map((job, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-xl p-5 sm:p-7 rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <a href={job.link} target="_blank" rel="noreferrer">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-green-600 transition">{job.title}</h2>
                </a>
                <p className="text-gray-600 mt-1 font-medium">{job.company || "Unknown Company"}</p>
                {job.location && <p className="text-gray-500 mt-1 text-sm sm:text-base">{job.location}</p>}
                {job.source && <p className="text-xs text-gray-400 mt-1">Source: {job.source}</p>}
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
                <a href={job.link} target="_blank" className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:bg-gray-300 transition text-center">
                  View Job
                </a>
                <button onClick={() => removeJob(job.link)} className="flex-1 bg-red-500 text-white p-3 sm:p-4 rounded-2xl font-bold shadow-lg hover:bg-red-600 transition">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-600 border-t">
        © {new Date().getFullYear()} QuickApplyAI
      </footer>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="bg-green-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">{icon}</div>
      <p className="text-gray-700 font-medium">{label}</p>
      <p className="text-4xl font-extrabold mt-2">{value}</p>
    </div>
  );
}

function FilterBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-full font-medium shadow transition ${
        active ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
