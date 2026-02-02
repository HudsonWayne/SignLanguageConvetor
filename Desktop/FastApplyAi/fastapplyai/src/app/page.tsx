"use client";
import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size to handle mobile menu
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenu(false); // close menu on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu items array for easy mapping
  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <FiUser /> },
    { label: "Upload CV", href: "/upload-cv", icon: <FiUpload /> },
    { label: "Find Jobs", href: "/find-jobs", icon: <FiSearch /> },
    { label: "Applied Jobs", href: "/applied", icon: null },
    { label: "Notifications", href: "/notifications", icon: <FiBell /> },
  ];

  return (
    <nav className="relative flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
        <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
          QA
        </div>
        <span className="tracking-wide whitespace-nowrap">QuickApplyAI</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-1 transition-all hover:text-green-600 ${
              item.label === "Dashboard" ? "bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 shadow-sm" : ""
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
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
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 px-4 hover:bg-green-50 rounded flex items-center gap-1"
                onClick={() => setMobileMenu(false)}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <Link
              href="/signin"
              onClick={() => setMobileMenu(false)}
              className="block py-2 px-4 bg-green-500 text-white rounded-md text-center hover:bg-green-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}