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

export default function AppliedJobsPage() {
  const [user, setUser] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      const name = email.split("@")[0];
      setUser(name);
    } else {
      setUser("User");
    }

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto border-b border-gray-100">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">QuickApplyAI</span>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
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
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md shadow-sm hover:bg-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiFileText /> Applied Jobs
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiBell /> Notifications
          </Link>
          <span className="hidden sm:block text-gray-500">
            Welcome,&nbsp;
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
      <main className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 2xl:px-40 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-3 tracking-tight">
            Applied Jobs
          </h1>
          <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto">
            Track your job applications, see which ones are viewed, and monitor your CV visibility.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-green-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-green-600 text-3xl" />
            </div>
            <p className="text-gray-700 font-medium">Total Applications</p>
            <p className="text-4xl font-extrabold mt-2 text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-blue-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <FiEye className="text-blue-600 text-3xl" />
            </div>
            <p className="text-gray-700 font-medium">Applications Viewed</p>
            <p className="text-4xl font-extrabold mt-2 text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-purple-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="text-purple-600 text-3xl" />
            </div>
            <p className="text-gray-700 font-medium">Total CV Views</p>
            <p className="text-4xl font-extrabold mt-2 text-gray-800">0</p>
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button className="bg-green-500 text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            All Applications
          </button>
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-medium shadow-md hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            CV Viewed
          </button>
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-medium shadow-md hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Pending Review
          </button>
        </div>

        {/* NO APPLICATIONS CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-16 text-center transition-all hover:shadow-3xl hover:-translate-y-1">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6">
              <FiFileText className="text-gray-400 text-5xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              No Applications Yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven’t applied to any jobs yet. Start applying to your dream roles today!
            </p>
            <Link
              href="/find-jobs"
              className="bg-green-500 text-white px-10 py-3 rounded-full font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Find Jobs
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 mt-12 text-gray-600 text-sm border-t border-gray-200">
        © {new Date().getFullYear()} QuickApplyAI — All rights reserved.
      </footer>
    </div>
  );
}
