"use client";
import Link from "next/link";
import { FiUpload, FiSearch, FiCheckCircle, FiBell, FiUser } from "react-icons/fi";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-50 text-gray-900 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-20 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">QA</div>
          <span className="tracking-wide">QuickApplyAI</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm"
          >
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied" className="hover:text-green-600 transition-all">
            Applied Jobs
          </Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600 transition-all">
            <FiBell /> Notifications
          </Link>
        </div>

        <Link
          href="/signin"
          className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-600 transition-all shadow-md"
        >
          Sign In
        </Link>
      </nav>

      {/* HERO SECTION */}
      <div className="text-center mt-20 mb-10 px-4">
        <div className="flex justify-center">
          <div className="bg-green-50 border border-green-300 text-green-600 rounded-full p-6 text-4xl shadow-inner animate-pulse">
            📈
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mt-8 tracking-tight">
          Welcome to QuickApplyAI
        </h1>

        <p className="text-gray-600 mt-4 text-lg md:w-2/3 mx-auto leading-relaxed">
          Revolutionize your job search with AI-powered applications. Upload your CV,
          let our system find matching jobs, and automatically apply to increase your
          hiring chances.
        </p>

        <Link
          href="/signin"
          className="mt-8 inline-block bg-green-500 text-white px-7 py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition-all"
        >
          Get Started — Sign In
        </Link>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-20 mt-10 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
          <FiUpload className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Upload CV</h3>
          <p className="text-gray-600 mt-1">Upload your CV and let AI extract your skills automatically.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
          <FiSearch className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Smart Job Matching</h3>
          <p className="text-gray-600 mt-1">Our AI scans multiple platforms to find jobs that match your profile.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
          <FiCheckCircle className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Auto Apply</h3>
          <p className="text-gray-600 mt-1">Automatically apply to relevant positions and track your success.</p>
        </div>
      </div>
    </div>
  );
}
