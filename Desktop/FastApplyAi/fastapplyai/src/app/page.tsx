"use client";

import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

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

  // 🚨 Prevent hydration mismatch
  if (!mounted) return null;

  return (
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

      {/* Mobile Menu */}
      {mobileMenu && isMobile && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t z-50 md:hidden">
          <div className="flex flex-col p-5 space-y-3 text-gray-700 font-medium">
            <Link href="/dashboard" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded">
              Dashboard
            </Link>
            <Link href="/upload-cv" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded">
              Upload CV
            </Link>
            <Link href="/find-jobs" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded">
              Find Jobs
            </Link>
            <Link href="/applied" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded">
              Applied Jobs
            </Link>
            <Link href="/notifications" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded">
              Notifications
            </Link>
            <Link href="/signin" onClick={() => setMobileMenu(false)} className="block py-2 px-4 hover:bg-green-50 rounded text-green-600 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}