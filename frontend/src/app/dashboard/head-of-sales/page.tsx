"use client";

import { useState } from "react";
import {
  Crown, Users, TrendingUp, DollarSign, Megaphone,
  Target, MapPin, Building2, Zap, ArrowRight, Activity
} from "lucide-react";

const kpis = [
  { label: "Total Leads", value: "12,847", change: "+18.2%", icon: Users, positive: true },
  { label: "Conversion Rate", value: "4.7%", change: "+0.8%", icon: TrendingUp, positive: true },
  { label: "Revenue Pipeline", value: "$2.4M", change: "+$340K", icon: DollarSign, positive: true },
  { label: "Active Campaigns", value: "14", change: "+3", icon: Megaphone, positive: true },
];

const agentStatuses = [
  { name: "Head of Sales", status: "active" },
  { name: "Signal Hunter", status: "active" },
  { name: "ICP Analyst", status: "active" },
  { name: "Account Researcher", status: "idle" },
  { name: "Lead Enricher", status: "active" },
  { name: "Intent Scorer", status: "active" },
  { name: "Cross-Platform Copywriter", status: "idle" },
  { name: "Outreach Operator", status: "active" },
  { name: "Reply Analyst", status: "active" },
  { name: "Objection Handler", status: "idle" },
  { name: "Follow-up Orchestrator", status: "active" },
  { name: "Meeting Qualifier", status: "idle" },
  { name: "Pipeline Analyst", status: "active" },
  { name: "Sales Manager", status: "active" },
  { name: "Inbound Strategist", status: "idle" },
  { name: "CRM Synchronizer", status: "active" },
];

const campaigns = [
  { name: "Enterprise SaaS Q3", status: "Active", sent: 1240, total: 2000, replyRate: "12.4%" },
  { name: "Fintech Founders", status: "Active", sent: 890, total: 1500, replyRate: "9.8%" },
  { name: "Healthcare IT Leaders", status: "Paused", sent: 430, total: 800, replyRate: "15.1%" },
  { name: "Series B Startups", status: "Draft", sent: 0, total: 600, replyRate: "—" },
];

export default function HeadOfSalesPage() {
  const [industry, setIndustry] = useState("SaaS / B2B Technology");
  const [companySize, setCompanySize] = useState("50-500");
  const [geography, setGeography] = useState("North America");

  const activeCount = agentStatuses.filter(a => a.status === "active").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Crown className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Head of Sales</h1>
          <p className="text-gray-400 text-sm mt-1">Strategy Dashboard &bull; Orchestrating {activeCount} active agents</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-400">System Online</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-[#1A1A1A] border border-white/10 p-6 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-gold" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-3xl font-bold font-heading">{kpi.value}</p>
            <p className="text-gray-500 text-sm mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Target Audience Section */}
        <div className="lg:col-span-1 rounded-xl bg-[#1A1A1A] border border-white/10 p-6">
          <h2 className="text-lg font-heading font-semibold mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            Target Audience
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Industry</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Company Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={companySize}
                  onChange={e => setCompanySize(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Geography</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={geography}
                  onChange={e => setGeography(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="lg:col-span-2 rounded-xl bg-[#1A1A1A] border border-white/10 p-6">
          <h2 className="text-lg font-heading font-semibold mb-5 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gold" />
            Campaign Overview
          </h2>
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.name} className="bg-[#111111] rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    c.status === "Active" ? "bg-green-500/10 text-green-400" :
                    c.status === "Paused" ? "bg-amber-500/10 text-amber-400" :
                    "bg-gray-500/10 text-gray-400"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{c.sent.toLocaleString()} / {c.total.toLocaleString()} sent</span>
                  <span>Reply rate: {c.replyRate}</span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient rounded-full transition-all"
                    style={{ width: `${(c.sent / c.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="mt-10 rounded-xl bg-[#1A1A1A] border border-white/10 p-6">
        <h2 className="text-lg font-heading font-semibold mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold" />
          Agent Swarm Status
          <span className="ml-auto text-sm font-normal text-gray-500">{activeCount} active &bull; {16 - activeCount} idle</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {agentStatuses.map((agent) => (
            <div
              key={agent.name}
              className="bg-[#111111] rounded-lg p-3 border border-white/5 flex items-center gap-3"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.status === "active" ? "bg-green-400" : "bg-gray-600"}`} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{agent.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{agent.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <button className="bg-gold-gradient text-black font-semibold px-10 py-3.5 rounded-lg flex items-center gap-3 hover:opacity-90 transition animate-pulse-glow text-sm">
          <Zap className="w-5 h-5" />
          Launch Campaign
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
