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

export default function UploadCVPage() {
  const [user, setUser] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      const name = email.split("@")[0];
      setUser(name);
    } else {
      setUser("User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Mock upload delay
      await new Promise((res) => setTimeout(res, 1500));
      setMessage("✅ CV uploaded successfully!");
      setFile(null);
    } catch {
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden animate-gradientFlow">
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
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiUser /> Dashboard
          </Link>
          <Link
            href="/upload-cv"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
          >
            <FiUpload /> Upload CV
          </Link>
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 hover:text-green-600 transition-all"
          >
            <FiSearch /> Find Jobs
          </Link>
          <Link
            href="/applied"
            className="hover:text-green-600 transition-all"
          >
            Applied Jobs
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
      <main className="flex flex-col items-center justify-center text-center py-24 px-6 sm:px-10 md:px-20">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md transition-all hover:shadow-2xl">
          <FiUpload className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Upload Your CV
          </h1>
          <p className="text-gray-600 mb-6">
            Select your CV file (PDF, DOCX, or TXT) to analyze and find job matches.
          </p>

          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={uploading}
              className={`w-full bg-green-500 text-white py-2.5 rounded-md font-semibold hover:bg-green-600 transition-all shadow-md ${
                uploading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
              }`}
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
