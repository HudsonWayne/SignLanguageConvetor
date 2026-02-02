"use client";

import Link from "next/link";
import { FiUpload, FiSearch, FiCheckCircle } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%]">
      
      <Navbar />

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
          your CV, let our system find matching jobs, and automatically apply.
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
            Our AI finds jobs that match your profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <FiCheckCircle className="mx-auto text-5xl text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Auto Apply</h3>
          <p className="text-gray-600 mt-1">
            Apply automatically and track results.
          </p>
        </div>
      </div>
    </div>
  );
}