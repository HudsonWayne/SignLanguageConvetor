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
import { motion } from "framer-motion";

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
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json(); // parse JSON directly

      if (res.ok) {
        console.log("Extracted CV data:", data);
        setMessage("✅ CV uploaded & parsed successfully!");
        setFile(null);
        localStorage.setItem("cvData", JSON.stringify(data));
        setTimeout(() => (window.location.href = "/cv-analysis"), 800);
      } else {
        setMessage("❌ Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-300 text-gray-900 font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.4),transparent_50%)]" />

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 sm:px-10 lg:px-20 py-4 shadow-md bg-white/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/40">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">QA</div>
          <span className="tracking-wide">QuickApplyAI</span>
        </div>

        <div className="flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiUser /> Dashboard
          </Link>
          <Link
            href="/upload-cv"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
          >
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied" className="hover:text-green-600 transition-all">
            <FiFileText /> Applied Jobs
          </Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiBell /> Notifications
          </Link>
          <span className="hidden sm:block text-gray-500">
            Hi, <span className="font-semibold text-gray-700 capitalize">{user}</span>
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
      <main className="flex flex-col items-center justify-center py-24 px-6 sm:px-10 md:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10 w-full max-w-md hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] transition-all duration-300"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FiUpload className="text-green-500 text-6xl mx-auto mb-4 drop-shadow-md" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">
            Upload Your CV
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your <span className="font-semibold">PDF, DOCX, or TXT</span> resume to find personalized job matches.
          </p>

          <form onSubmit={handleUpload}>
            <div className="flex flex-col items-center justify-center w-full mb-6">
              <label
                htmlFor="file"
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <p className="text-gray-600 mb-2">
                  {file ? (
                    <span className="text-green-600 font-semibold">{file.name}</span>
                  ) : (
                    <>
                      Drag & drop your file here or{" "}
                      <span className="text-green-500 font-semibold">click to browse</span>
                    </>
                  )}
                </p>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={uploading}
              className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold transition-all shadow-md ${
                uploading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-lg hover:from-green-600 hover:to-green-700"
              }`}
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </motion.button>
          </form>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-6 text-sm font-medium ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </motion.p>
          )}
        </motion.div>

        {/* Floating Decorative Bubbles */}
        <motion.div
          className="absolute bottom-10 right-10 w-20 h-20 bg-green-400 rounded-full blur-2xl opacity-40"
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-30"
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </main>
    </div>
  );
}
