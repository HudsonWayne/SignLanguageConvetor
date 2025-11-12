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

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user info from localStorage or backend auth state
    const email = localStorage.getItem("email") || "waynewaynedenbenhura@gmail.com";
    const username = email.split("@")[0];
    setUser(username);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5fbff]">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-3 shadow bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
          <div className="bg-green-500 text-white px-2 py-1 rounded-md shadow-sm">QA</div>
          <span>QuickApplyAI</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition"
          >
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1 hover:text-green-600">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied" className="hover:text-green-600">
            Applied Jobs
          </Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600">
            <FiBell /> Notifications
          </Link>
          <span className="text-gray-500 hidden sm:block">
            Welcome, <span className="font-semibold text-gray-700">{user}</span>
          </span>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/signin";
            }}
            className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome back, {user}
            </h1>
            <p className="text-gray-600 mt-1">
              Track your job applications and boost your hiring success
            </p>
          </div>
          <Link
            href="/upload-cv"
            className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition"
          >
            Upload New CV
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {/* Total Applications */}
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="text-green-500 text-3xl mb-2">
              <FiFileText />
            </div>
            <p className="text-gray-700 font-medium">Total Applications</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>

          {/* CV Views */}
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="text-green-500 text-3xl mb-2">
              <FiUser />
            </div>
            <p className="text-gray-700 font-medium">CV Views</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>

          {/* Response Rate */}
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="text-green-500 text-3xl mb-2">
              📈
            </div>
            <p className="text-gray-700 font-medium">Response Rate</p>
            <p className="text-2xl font-bold mt-1">0%</p>
          </div>

          {/* Active Searches */}
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="text-green-500 text-3xl mb-2">
              <FiSearch />
            </div>
            <p className="text-gray-700 font-medium">Active Searches</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
        </div>

        {/* RECENT APPLICATIONS */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Applications</h2>
            <Link href="/applied" className="text-green-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FiFileText className="text-4xl text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No applications yet</p>
            <Link
              href="/find-jobs"
              className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition"
            >
              Find Jobs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
