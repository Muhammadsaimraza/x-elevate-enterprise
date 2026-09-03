"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AGENTS } from "./agents";

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-gold-gradient">
          B2B Outbound Sales OS
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
          Your AI-powered outbound sales swarm. Select an agent to run prospecting,
          outreach, and pipeline tasks across X and LinkedIn.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {AGENTS.map((agent, i) => {
          const AgentIcon = agent.icon;
          return (
            <Link
              key={agent.id}
              href={`/dashboard/${agent.id}`}
              className="group relative rounded-xl bg-[#1A1A1A] border border-white/5 p-5 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_24px_rgba(212,175,55,0.08)]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-gold/15 group-hover:border-gold/30">
                <AgentIcon className="w-5 h-5 text-gold" />
              </div>

              {/* Name + description */}
              <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-gold transition-colors duration-200">
                {agent.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {agent.description}
              </p>

              {/* Footer: badges + status */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {agent.platforms.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-gold/20 text-gold/70 bg-gold/5"
                    >
                      {p === "x" ? "X" : "LinkedIn"}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] font-medium text-green-400/80 uppercase tracking-wider">
                    Idle
                  </span>
                </div>
              </div>

              {/* Hover arrow */}
              <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-gold/0 group-hover:text-gold/50 transition-all duration-300 translate-x-1 group-hover:translate-x-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
