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

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Get email from localStorage (set during login)
    const email = localStorage.getItem("email");
    if (email) {
      const name = email.split("@")[0];
      setUser(name);
    } else {
      setUser("User");
    }

    // Responsive animation trigger
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    const fetchApplied = async () => {
      let apiJobs: Job[] = [];
      try {
        const res = await fetch("/api/applied-jobs");
        if (res.ok) {
          apiJobs = (await res.json()).map((j: Job) => ({
            ...j,
            status: j.status || "Applied",
          }));
        }
      } catch {}

      const stored = localStorage.getItem("appliedJobsData");
      let localJobs: Job[] = [];
      if (stored) {
        try {
          localJobs = JSON.parse(stored);
        } catch {}
      }

      const mergedJobs = [
        ...apiJobs,
        ...localJobs.filter(
          (lj) => !apiJobs.some((aj) => aj.link && aj.link === lj.link)
        ),
      ];
      setJobs(mergedJobs);
    };

    fetchApplied();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  const totalApplications = jobs.length;
  const cvViews = jobs.filter((j) => j.status === "Viewed").length;
  const pending = jobs.filter((j) => j.status === "Pending").length;
  const responseRate = totalApplications
    ? Math.round((cvViews / totalApplications) * 100)
    : 0;
  const activeSearches = pending;
  const recentApplications = jobs.slice(-3).reverse();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">QuickApplyAI</span>
        </div>

        <div className="flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <FiUser /> Dashboard
          </Link>
          <Link
            href="/upload-cv"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiUpload /> Upload CV
          </Link>
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiSearch /> Find Jobs
          </Link>
          <Link
            href="/applied"
            className="hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            Applied Jobs
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiBell /> Notifications
          </Link>
          <span className="hidden sm:block text-gray-500">
            Welcome,{" "}
            <span className="font-semibold text-gray-700">{user}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main
        className={`px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 2xl:px-40 py-12 ${
          isMobile ? "" : "animate-fadeUp"
        }`}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Welcome back,{" "}
              <span className="text-green-600">{user}</span>
            </h1>
            <p className="text-gray-700 mt-2 text-base sm:text-lg">
              Track your job applications and boost your hiring success.
            </p>
          </div>
          <Link
            href="/upload-cv"
            className="mt-4 sm:mt-0 bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Upload New CV
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Total Applications",
              icon: <FiFileText />,
              value: totalApplications.toString(),
            },
            { title: "CV Views", icon: <FiUser />, value: cvViews.toString() },
            {
              title: "Response Rate",
              icon: "📈",
              value: `${responseRate}%`,
            },
            {
              title: "Active Searches",
              icon: <FiSearch />,
              value: activeSearches.toString(),
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div className="text-green-500 text-4xl mb-2 flex justify-center">
                {card.icon}
              </div>
              <p className="text-gray-700 font-medium">{card.title}</p>
              <p className="text-3xl font-extrabold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* RECENT APPLICATIONS */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all hover:shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Applications
            </h2>
            <Link
              href="/applied"
              className="text-green-600 hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="bg-green-50 border border-green-200 rounded-full p-5 text-green-500 mb-4 shadow-inner">
                <FiFileText className="text-4xl" />
              </div>
              <p className="text-gray-600 mb-6 text-base">
                No applications yet
              </p>
              <Link
                href="/find-jobs"
                className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Find Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((job, index) => (
                <div
                  key={job.link ?? index}
                  className="flex items-center justify-between border-b last:border-b-0 pb-4"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {job.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.company}
                    </p>
                    {job.location && (
                      <p className="text-xs text-gray-400">
                        {job.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {job.status || "Applied"}
                    </span>
                    {typeof job.match === "number" && (
                      <p className="mt-1 text-xs text-gray-500">
                        {job.match}% match
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
