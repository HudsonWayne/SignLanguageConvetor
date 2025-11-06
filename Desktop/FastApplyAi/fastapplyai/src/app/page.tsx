"use client";
import Link from "next/link";
import { FiUpload, FiSearch, FiCheckCircle, FiBell, FiUser } from "react-icons/fi";

export default function HomePage() {
  return (
    <div
      className="
        min-h-screen 
        bg-gradient-to-br 
        from-purple-300 via-blue-200 to-green-200 
        text-gray-900 
        font-sans 
        overflow-x-hidden 
        animate-gradientFlow
        bg-[length:200%_200%]
      "
    >
      {/* NAVBAR */}
      <nav className="
        flex items-center justify-between 
        px-4 sm:px-6 md:px-16 lg:px-20 
        py-4 shadow-md bg-white sticky top-0 z-50 
        backdrop-blur-md bg-opacity-90 
        animate-fadeDown
      ">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide">QuickApplyAI</span>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-gray-700 font-medium">
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
          <Link href="/applied" className="hover:text-green-600 transition-all hover:-translate-y-0.5">
            Applied Jobs
          </Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5">
            <FiBell /> Notifications
          </Link>
        </div>

        <Link
          href="/signin"
          className="
            bg-green-500 text-white 
            px-3 sm:px-4 py-2 rounded-md 
            flex items-center gap-1 
            hover:bg-green-600 transition-all 
            shadow-md hover:shadow-lg hover:-translate-y-0.5
            text-sm sm:text-base
          "
        >
          Sign In
        </Link>
      </nav>

      {/* HERO */}
      <div className="text-center mt-16 sm:mt-20 mb-10 px-4 animate-fadeUp">
        <div className="flex justify-center">
          <div className="
            bg-green-50 border border-green-300 text-green-600 
            rounded-full p-5 sm:p-6 
            text-3xl sm:text-4xl 
            shadow-inner animate-bounceSlow
          ">
            📈
          </div>
        </div>

        <h1 className="
          text-3xl sm:text-4xl md:text-5xl 
          font-extrabold mt-6 sm:mt-8 
          tracking-tight animate-slideUp opacity-0 animation-delay-200
        ">
          Welcome to QuickApplyAI
        </h1>

        <p className="
          text-gray-600 mt-4 
          text-base sm:text-lg 
          md:w-2/3 mx-auto 
          leading-relaxed animate-slideUp opacity-0 animation-delay-400
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
            hover:scale-105 sm:hover:scale-110 active:scale-95 
            transition-all animate-slideUp opacity-0 animation-delay-600
          "
        >
          Get Started — Sign In
        </Link>
      </div>

      {/* FEATURES */}
      <div className="
        grid 
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
        gap-6 px-6 sm:px-10 md:px-16 lg:px-20 
        mt-8 sm:mt-10 pb-20
      ">
        {/* Feature */}
        <div className="
          bg-white rounded-2xl shadow-lg p-6 text-center 
          hover:shadow-2xl hover:scale-105 sm:hover:scale-110 
          transition-all cursor-pointer animate-pop opacity-0 animation-delay-700
        ">
          <FiUpload className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3 animate-float" />
          <h3 className="text-lg sm:text-xl font-semibold">Upload CV</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Upload your CV and let AI extract your skills automatically.</p>
        </div>

        {/* Feature */}
        <div className="
          bg-white rounded-2xl shadow-lg p-6 text-center 
          hover:shadow-2xl hover:scale-105 sm:hover:scale-110 
          transition-all cursor-pointer animate-pop opacity-0 animation-delay-900
        ">
          <FiSearch className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3 animate-floatSlow" />
          <h3 className="text-lg sm:text-xl font-semibold">Smart Job Matching</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Our AI scans multiple platforms to find jobs that match your profile.</p>
        </div>

        {/* Feature */}
        <div className="
          bg-white rounded-2xl shadow-lg p-6 text-center 
          hover:shadow-2xl hover:scale-105 sm:hover:scale-110 
          transition-all cursor-pointer animate-pop opacity-0 animation-delay-1100
        ">
          <FiCheckCircle className="mx-auto text-4xl sm:text-5xl text-green-500 mb-3 animate-float" />
          <h3 className="text-lg sm:text-xl font-semibold">Auto Apply</h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Automatically apply to relevant positions and track your success.</p>
        </div>
      </div>
    </div>
  );
}
