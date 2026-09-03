"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "World Specific Schemes", href: "#schemes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-gold/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-black/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-gold-gradient">
                X-Elevate
              </span>
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gold transition-all duration-500 group-hover:w-full" />
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-300 hover:text-white group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-9 bg-white/10 rounded-md animate-pulse" />
                <div className="w-20 h-9 bg-white/10 rounded-md animate-pulse" />
              </div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 text-sm font-semibold text-black bg-gold-gradient rounded-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 flex items-center gap-1.5"
              >
                Dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-semibold text-gold border border-gold/50 rounded-md transition-all duration-300 hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 text-sm font-semibold text-black bg-gold-gradient rounded-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 flex items-center gap-1.5"
                >
                  Sign Up
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-gray-300 hover:text-gold transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black/95 backdrop-blur-xl border-t border-gold/10 px-4 py-4 space-y-1">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-3 text-gray-300 hover:text-gold hover:bg-white/5 rounded-lg transition-all duration-300 text-sm font-medium"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 px-4 border-t border-white/5 mt-3">
            {isLoading ? (
              <>
                <div className="flex-1 h-10 bg-white/10 rounded-md animate-pulse" />
                <div className="flex-1 h-10 bg-white/10 rounded-md animate-pulse" />
              </>
            ) : user ? (
              <Link
                href="/dashboard"
                className="flex-1 text-center py-2.5 text-sm font-semibold text-black bg-gold-gradient rounded-md transition-all"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-gold border border-gold/40 rounded-md hover:bg-gold/10 transition-all"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-black bg-gold-gradient rounded-md transition-all"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
