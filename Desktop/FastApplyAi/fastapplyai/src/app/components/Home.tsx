"use client";
import { Link } from "react-router-dom";
import { FiUpload, FiSearch, FiCheckCircle, FiBell, FiUser } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white text-gray-900">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-20 py-4 shadow-sm bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
          QuickApplyAI
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-700">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-green-600">
            <FiUser /> Dashboard
          </Link>
          <Link to="/upload-cv" className="flex items-center gap-1 hover:text-green-600">
            <FiUpload /> Upload CV
          </Link>
          <Link to="/find-jobs" className="flex items-center gap-1 hover:text-green-600">
            <FiSearch /> Find Jobs
          </Link>
          <Link to="/applied" className="hover:text-green-600">
            Applied Jobs
          </Link>
          <Link to="/notifications" className="flex items-center gap-1 hover:text-green-600">
            <FiBell /> Notifications
          </Link>
        </div>

        <Link
          to="/signin"
          className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-600"
        >
          Sign In
        </Link>
      </nav>

      {/* HERO SECTION */}
      <div className="text-center mt-20 mb-10 px-4">
        <div className="flex justify-center">
          <div className="bg-green-50 border border-green-300 text-green-600 rounded-full p-6 text-3xl">
            📈
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mt-6">
          Welcome to QuickApplyAI
        </h1>

        <p className="text-gray-600 mt-4 text-lg md:w-2/3 mx-auto leading-relaxed">
          Revolutionize your job search with AI-powered applications. Upload your CV,
          let our system find matching jobs, and automatically apply to increase your
          hiring chances.
        </p>

        <Link
          to="/signin"
          className="mt-8 inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium text-lg shadow hover:bg-green-600"
        >
          Get Started - Sign In
        </Link>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-20 mt-10 pb-20">
        <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <FiUpload className="mx-auto text-4xl text-green-500 mb-2" />
          <h3 className="text-xl font-semibold">Upload CV</h3>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <FiSearch className="mx-auto text-4xl text-green-500 mb-2" />
          <h3 className="text-xl font-semibold">Smart Job Matching</h3>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <FiCheckCircle className="mx-auto text-4xl text-green-500 mb-2" />
          <h3 className="text-xl font-semibold">Auto Apply</h3>
        </div>
      </div>
    </div>
  );
}
