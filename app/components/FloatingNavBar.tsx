"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    href: "/",
    label: (
      <span className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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
        <span className="font-extrabold text-lg">Unwind</span>
      </span>
    ),
  },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/about", label: "About" },
];

export default function FloatingNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-8 left-1/2 z-50 -translate-x-1/2 bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-opacity-80 backdrop-blur-xl shadow-2xl rounded-full px-8 py-3 flex gap-8 items-center border border-white/20 animate-fade-in-up">
      {navLinks.map((link) => (
        <Link
          key={typeof link.label === "string" ? link.label : "home"}
          href={link.href}
          className={`text-lg font-semibold transition-colors duration-300 px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 hover:bg-white/10 hover:text-pink-200 ${
            pathname === link.href
              ? "bg-white/20 text-pink-200 shadow-md"
              : "text-white/90"
          } ${
            link.href === "/"
              ? "pl-5 pr-5 py-2 text-xl flex items-center gap-2 font-extrabold"
              : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
