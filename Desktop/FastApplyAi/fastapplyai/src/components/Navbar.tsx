"use client";
import { useState } from "react";
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

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="relative flex items-center justify-between px-6 md:px-20 py-4 shadow-sm bg-white sticky top-0 z-50">
      {/* LOGO */}
      <div className="flex items-center gap-2 text-xl font-bold">
        <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
        QuickApplyAI
      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-700">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-green-600">
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
        <Link
          href="/signin"
          className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-600"
        >
          Sign In
        </Link>
      </div>

      {/* MOBILE TOGGLE */}
      <button
        className="md:hidden text-2xl text-gray-700"
        onClick={() => setMobileMenu(!mobileMenu)}
      >
        {mobileMenu ? <FiX /> : <FiMenu />}
      </button>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t z-50 md:hidden">
          <div className="flex flex-col p-5 space-y-3 text-gray-700 font-medium">
            <Link
              href="/dashboard"
              className="block py-2 px-4 hover:bg-green-50 rounded"
              onClick={() => setMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/upload-cv"
              className="block py-2 px-4 hover:bg-green-50 rounded"
              onClick={() => setMobileMenu(false)}
            >
              Upload CV
            </Link>
            <Link
              href="/find-jobs"
              className="block py-2 px-4 hover:bg-green-50 rounded"
              onClick={() => setMobileMenu(false)}
            >
              Find Jobs
            </Link>
            <Link
              href="/applied"
              className="block py-2 px-4 hover:bg-green-50 rounded"
              onClick={() => setMobileMenu(false)}
            >
              Applied Jobs
            </Link>
            <Link
              href="/notifications"
              className="block py-2 px-4 hover:bg-green-50 rounded"
              onClick={() => setMobileMenu(false)}
            >
              Notifications
            </Link>
            <Link
              href="/signin"
              className="block py-2 px-4 bg-green-500 text-white rounded-md text-center hover:bg-green-600"
              onClick={() => setMobileMenu(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}