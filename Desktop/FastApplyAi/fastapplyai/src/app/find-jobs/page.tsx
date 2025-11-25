"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiFileText,
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

export default function FindJobsPage() {
  const [user, setUser] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("email");
    setUser(email || "user@example.com");

    const skills = JSON.parse(localStorage.getItem("skills") || "[]");

    if (!skills || skills.length === 0) {
      setLoading(false);
      return;
    }

    // 🔥 Fetch real jobs
    fetch("/api/search-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] text-gray-900 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-10 lg:px-20 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span>QuickApplyAI</span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/dashboard" className="hover:text-green-600 flex items-center gap-1">
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="hover:text-green-600 flex items-center gap-1">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="bg-green-500 text-white px-3 py-2 rounded-md shadow-sm hover:bg-green-600 flex items-center gap-1">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied" className="hover:text-green-600 flex items-center gap-1">
            <FiFileText /> Applied Jobs
          </Link>
          <Link href="/notifications" className="hover:text-green-600 flex items-center gap-1">
            <FiBell /> Notifications
          </Link>

          <span className="hidden sm:block text-gray-500">
            Welcome, <span className="font-semibold text-gray-700">{user}</span>
          </span>

          <button
            onClick={handleLogout}
            className="bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 shadow-sm flex items-center gap-1"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="px-6 md:px-20 py-14">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Job Matches for You</h1>

        {/* LOADING */}
        {loading && (
          <p className="text-gray-600 text-lg animate-pulse">Fetching jobs...</p>
        )}

        {/* NO JOBS */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <FiSearch className="mx-auto text-7xl mb-4" />
            <h2 className="text-xl font-bold mb-2">No matches found</h2>
            <p className="mb-6">Try uploading a CV with more skills.</p>

            <Link
              href="/upload-cv"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Upload CV Again
            </Link>
          </div>
        )}

        {/* JOBS LIST */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer border"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {job.job_title || "Untitled Job"}
              </h2>

              <p className="text-gray-600 mb-1">
                {job.employer_name || "Unknown Company"}
              </p>

              <p className="text-gray-500 text-sm mb-4">
                {job.job_city}, {job.job_country}
              </p>

              <a
                href={job.job_apply_link}
                target="_blank"
                className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
