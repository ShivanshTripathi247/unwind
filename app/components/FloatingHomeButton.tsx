"use client";

import Link from "next/link";

export default function FloatingHomeButton() {
  return (
    <Link
      href="/"
      className="fixed top-8 left-8 z-50 flex items-center gap-3 bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-opacity-90 backdrop-blur-xl shadow-2xl rounded-full px-6 py-3 border border-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
      style={{ textDecoration: "none" }}
      aria-label="Go to Unwind Home"
    >
      <span className="w-7 h-7 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-shell-icon lucide-shell"
        >
          <path d="M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44" />
        </svg>
      </span>
      <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 group-hover:from-pink-300 group-hover:to-blue-300 transition-colors duration-300">
        Unwind
      </span>
    </Link>
  );
}
