"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Analyzer" },
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
          key={link.href}
          href={link.href}
          className={`text-lg font-semibold transition-colors duration-300 px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 hover:bg-white/10 hover:text-pink-200 ${
            pathname === link.href
              ? "bg-white/20 text-pink-200 shadow-md"
              : "text-white/90"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
