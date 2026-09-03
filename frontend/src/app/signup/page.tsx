"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api, ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
      });
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gold pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Card */}
          <div className="bg-midnight-light border border-white/10 rounded-2xl p-8 shadow-2xl glow-gold">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-extrabold text-gold-gradient mb-2">
                Create Account
              </h1>
              <p className="text-gray-400 text-sm">Join X-Elevate and start elevating</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="Repeat your password"
                />
              </div>

              {/* Error / Success */}
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold text-black bg-gold-gradient rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : null}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-gold font-semibold hover:text-gold-light transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
