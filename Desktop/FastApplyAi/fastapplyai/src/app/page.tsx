"use client";
import Link from "next/link";
import { FiUpload, FiSearch, FiCheckCircle, FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile screen to disable animations
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`
        min-h-screen 
        bg-gradient-to-br 
        from-purple-300 via-blue-200 to-green-200 
        text-gray-900 
        font-sans 
        overflow-x-hidden 
        bg-[length:200%_200%]
        ${isMobile ? "" : "animate-gradientFlow"}
      `}
    >
      {/* NAVBAR */}
      <nav className="
        flex items-center justify-between 
        px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40
        py-4 shadow-md bg-white sticky top-0 z-50 
        backdrop-blur-md bg-opacity-90
        w-full max-w-[1920px] mx-auto
      ">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">QuickApplyAI</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied" className="hover:text-green-600 transition-all hover:-translate-y-0.5">Applied Jobs</Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5">
            <FiBell /> Notifications
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>

        {/* Sign in (Desktop Only) */}
        <Link
          href="/signin"
          className="
            hidden md:flex
            bg-green-500 text-white 
            px-4 py-2 rounded-md 
            items-center gap-1 
            hover:bg-green-600 transition-all 
            shadow-md hover:shadow-lg hover:-translate-y-0.5
            text-sm sm:text-base
          "
        >
          Sign In
        </Link>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenu && (
        <div className="md:hidden bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard" className="block">Dashboard</Link>
          <Link href="/upload-cv" className="block">Upload CV</Link>
          <Link href="/find-jobs" className="block">Find Jobs</Link>
          <Link href="/applied" className="block">Applied Jobs</Link>
          <Link href="/notifications" className="block">Notifications</Link>
          <Link href="/signin" className="block text-green-600 font-semibold">Sign In</Link>
        </div>
      )}

      {/* HERO */}
      <div className={`text-center mt-14 sm:mt-20 mb-10 px-4 ${isMobile ? "" : "animate-fadeUp"}`}>
        <div className="flex justify-center">
          <div className="
            bg-green-50 border border-green-300 text-green-600 
            rounded-full p-5 sm:p-6 
            text-3xl sm:text-4xl 
            shadow-inner
          ">
            📈
          </div>
        </div>

        <h1 className="
          text-3xl sm:text-4xl md:text-5xl 
          font-extrabold mt-6 sm:mt-8 
          tracking-tight
        ">
          Welcome to QuickApplyAI
        </h1>

        <p className="
          text-gray-600 mt-4 
          text-base sm:text-lg 
          md:w-2/3 mx-auto 
          leading-relaxed
        ">
          Revolutionize your job search with AI-powered applications. Upload your CV,
          let our system find matching jobs, and automatically apply to increase your
          hiring chances.
        </p>

        <Link
          href="/signin"
          className="
            mt-6 sm:mt-8 inline-block 
            bg-green-500 text-white 
            px-6 sm:px-7 py-3 
            rounded-xl font-semibold 
            text-base sm:text-lg 
            shadow-lg hover:bg-green-600 
            transition-all
          "
        >
          Get Started — Sign In
        </Link>
      </div>

      {/* FEATURES */}
      <div className="
        grid 
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
        gap-6 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-40
        mt-8 sm:mt-10 pb-20
        w-full max-w-[1920px] mx-auto
      ">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all cursor-pointer">
          <FiUpload className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3" />
          <h3 className="text-lg sm:text-xl font-semibold">Upload CV</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Upload your CV and let AI extract your skills automatically.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all cursor-pointer">
          <FiSearch className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3" />
          <h3 className="text-lg sm:text-xl font-semibold">Smart Job Matching</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Our AI scans multiple platforms to find jobs that match your profile.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all cursor-pointer">
          <FiCheckCircle className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3" />
          <h3 className="text-lg sm:text-xl font-semibold">Auto Apply</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Automatically apply to relevant positions and track your success.</p>
        </div>
      </div>
    </div>
  );
}
