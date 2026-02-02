"use client";
import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiCheckCircle,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenu(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* NAVBAR */}
      <nav className="relative flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">
            QuickApplyAI
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm"
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

          <Link
            href="/signin"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all shadow-md text-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Dropdown */}
        {mobileMenu && isMobile && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t z-50 md:hidden">
            <div className="p-5 space-y-4 text-gray-700 font-medium">
              <Link href="/dashboard" onClick={() => setMobileMenu(false)} className="block">
                Dashboard
              </Link>
              <Link href="/upload-cv" onClick={() => setMobileMenu(false)} className="block">
                Upload CV
              </Link>
              <Link href="/find-jobs" onClick={() => setMobileMenu(false)} className="block">
                Find Jobs
              </Link>
              <Link href="/applied" onClick={() => setMobileMenu(false)} className="block">
                Applied Jobs
              </Link>
              <Link href="/notifications" onClick={() => setMobileMenu(false)} className="block">
                Notifications
              </Link>
              <Link
                href="/signin"
                onClick={() => setMobileMenu(false)}
                className="block text-green-600 font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div className="text-center mt-14 sm:mt-20 mb-10 px-4">
        <div className="flex justify-center">
          <div className="bg-green-50 border border-green-300 text-green-600 rounded-full p-6 text-4xl shadow-inner">
            📈
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mt-8">
          Welcome to QuickApplyAI
        </h1>

        <p className="text-gray-600 mt-4 text-lg md:w-2/3 mx-auto">
          Revolutionize your job search with AI-powered applications. Upload
          your CV, let our system find matching jobs, and automatically apply to
          increase your hiring chances.
        </p>

        <Link
          href="/signin"
          className="mt-8 inline-block bg-green-500 text-white px-7 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-600 transition-all"
        >
          Get Started — Sign In
        </Link>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-40 pb-20 max-w-[1920px] mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <FiUpload className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Upload CV</h3>
          <p className="text-gray-600 mt-1">
            Upload your CV and let AI extract your skills automatically.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <FiSearch className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Smart Job Matching</h3>
          <p className="text-gray-600 mt-1">
            Our AI scans multiple platforms to find jobs that match your profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <FiCheckCircle className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Auto Apply</h3>
          <p className="text-gray-600 mt-1">
            Automatically apply to relevant positions and track your success.
          </p>
        </div>
      </div>
    </div>
  );
}