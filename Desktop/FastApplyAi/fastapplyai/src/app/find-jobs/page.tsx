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

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setUser(email);
    } else {
      setUser("user@example.com");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] text-gray-900 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">QuickApplyAI</span>
        </div>

        <div className="flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiUser /> Dashboard
          </Link>
          <Link
            href="/upload-cv"
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiUpload /> Upload CV
          </Link>
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
          >
            <FiSearch /> Find Jobs
          </Link>
          <Link
            href="/applied"
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiFileText /> Applied Jobs
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiBell /> Notifications
          </Link>

          <span className="hidden sm:block text-gray-500">
            Welcome,{" "}
            <span className="font-semibold text-gray-700">{user}</span>
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-all shadow-sm"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex flex-col items-center justify-center text-center py-32 px-6 sm:px-10 md:px-20">
        <div className="text-gray-500 mb-6">
          <FiSearch className="text-7xl sm:text-8xl mx-auto" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Upload Your CV First
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          To find matching jobs, please upload and analyze your CV first.
        </p>
        <Link
          href="/upload-cv"
          className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
        >
          Upload CV
        </Link>
      </main>
    </div>
  );
}
