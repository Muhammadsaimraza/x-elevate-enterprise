"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, Menu, X, LogOut, ChevronRight, Loader2, Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AGENTS } from "./agents";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-midnight">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="text-sm text-gray-500 font-medium tracking-wide">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen overflow-hidden bg-midnight">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 h-screen flex flex-col
          bg-[#111] border-r border-gold/10
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Branding */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="font-heading text-xl font-extrabold tracking-tight text-gold-gradient">
              X-Elevate
            </span>
          </Link>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-600">
            Dashboard
          </p>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-thin">
          {/* Home link */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive("/dashboard")
                ? "bg-gold/10 text-gold border-l-2 border-gold"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }
            `}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Home</span>
          </Link>

          <div className="my-3 border-t border-white/5" />

          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            Agents
          </p>

          {AGENTS.map((agent) => {
            const AgentIcon = agent.icon;
            const href = `/dashboard/${agent.id}`;
            const active = isActive(href);
            return (
              <Link
                key={agent.id}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group
                  ${active
                    ? "bg-gold/10 text-gold border-l-2 border-gold font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent font-medium"
                  }
                `}
              >
                <AgentIcon className={`w-4 h-4 flex-shrink-0 ${active ? "text-gold" : "text-gray-500 group-hover:text-gray-300"}`} />
                <span className="truncate">{agent.name}</span>
              </Link>
            );
          })}

          <div className="my-3 border-t border-white/5" />

          {/* Settings link */}
          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive("/dashboard/settings")
                ? "bg-gold/10 text-gold border-l-2 border-gold"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }
            `}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User info */}
        <div className="flex-shrink-0 border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gold uppercase">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#111]/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading text-sm font-bold text-gold-gradient">X-Elevate</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-sm text-gray-400 truncate">
            {AGENTS.find((a) => pathname.includes(a.id))?.name || "Dashboard"}
          </span>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-midnight bg-grid-pattern">
          {children}
        </main>
      </div>
    </div>
  );
}
