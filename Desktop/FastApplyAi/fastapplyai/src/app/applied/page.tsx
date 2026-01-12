"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiFileText,
  FiBell,
  FiUser,
  FiLogOut,
  FiEye,
  FiTrendingUp,
} from "react-icons/fi";

/* ===================== TYPES ===================== */

interface AppliedJob {
  title: string;
  company: string;
  location?: string;
  link?: string;
  appliedAt?: string;
  status?: "Applied" | "Viewed" | "Pending";
}

/* ===================== PAGE ===================== */

export default function AppliedJobsPage() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [user, setUser] = useState<string>("User");
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

    // Fetch applied jobs
    fetch("/api/applied-jobs")
      .then((res) => res.json())
      .then((data) => {
        // Ensure status exists
        const normalized = data.map((j: AppliedJob) => ({
          ...j,
          status: j.status || "Applied",
        }));
        setJobs(normalized);
      })
      .catch(() => setJobs([]));

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

      {/* MAIN */}
      <main className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 2xl:px-40 py-16">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            Applied Jobs
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Track your job applications and monitor your progress.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Stat icon={<FiFileText />} label="Total Applications" value={total} />
          <Stat icon={<FiEye />} label="Applications Viewed" value={viewed} />
          <Stat
            icon={<FiTrendingUp />}
            label="Pending Review"
            value={pending}
          />
        </div>

        {/* FILTERS */}
        <div className="flex justify-center gap-4 mb-12">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterBtn>
          <FilterBtn
            active={filter === "viewed"}
            onClick={() => setFilter("viewed")}
          >
            Viewed
          </FilterBtn>
          <FilterBtn
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </FilterBtn>
        </div>

        {/* JOB LIST */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <h2 className="text-2xl font-semibold mb-3">
              No Applications Yet
            </h2>
            <p className="text-gray-500 mb-8">
              Start applying to jobs to see them here.
            </p>
            <Link
              href="/find-jobs"
              className="bg-green-500 text-white px-10 py-3 rounded-full font-semibold"
            >
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map((job, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h2 className="font-bold text-xl">{job.title}</h2>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>

                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  {job.status}
                </span>

                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    className="block mt-4 text-green-600 font-semibold"
                  >
                    View Job →
                  </a>
                )}
              </div>
            ))}
          </div>
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

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="bg-green-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">
        {icon}
      </div>
      <p className="text-gray-700 font-medium">{label}</p>
      <p className="text-4xl font-extrabold mt-2">{value}</p>
    </div>
  );
}

function FilterBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-full font-medium shadow transition ${
        active
          ? "bg-green-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
