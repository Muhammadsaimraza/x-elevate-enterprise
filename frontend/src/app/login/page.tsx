"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password" : err.message);
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
                Welcome Back
              </h1>
              <p className="text-gray-400 text-sm">Sign in to your X-Elevate account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Your password"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                  {error}
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
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gold font-semibold hover:text-gold-light transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
