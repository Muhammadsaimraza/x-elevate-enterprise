"use client";

import { useState } from "react";
import {
  Building2, Globe, Users, Calendar, DollarSign, TrendingUp,
  Share2, Newspaper, Cpu, UserCircle, FileText, Sparkles,
  MapPin, Award, ChevronRight
} from "lucide-react";

const tabs = ["Overview", "Financials", "Tech Stack", "Key People", "News"] as const;
type Tab = typeof tabs[number];

const company = {
  name: "NovaPay Technologies",
  industry: "Fintech / Payments",
  size: "250-500 employees",
  location: "San Francisco, CA",
  revenue: "$85M ARR",
  employees: 342,
  founded: 2018,
  description: "NovaPay is a next-generation payment infrastructure platform that enables SaaS companies to embed financial services directly into their products. The company offers APIs for payments, banking, and card issuance, serving over 200 enterprise clients including several Fortune 500 companies.",
};

const financials = [
  { round: "Series B", amount: "$45M", date: "Mar 2025", lead: "Sequoia Capital" },
  { round: "Series A", amount: "$18M", date: "Jan 2023", lead: "a16z" },
  { round: "Seed", amount: "$4.5M", date: "Jun 2020", lead: "Y Combinator" },
];

const techStack = [
  "React", "Node.js", "PostgreSQL", "Redis", "Kubernetes", "AWS",
  "Stripe", "Plaid", "Terraform", "GraphQL", "Kafka", "Datadog",
  "Snowflake", "Segment", "Salesforce", "HubSpot"
];

const keyPeople = [
  { name: "Sarah Chen", title: "CEO & Co-founder", linkedin: "sarah-chen" },
  { name: "Marcus Williams", title: "VP of Sales", linkedin: "marcus-w" },
  { name: "Priya Patel", title: "CTO", linkedin: "priya-patel" },
  { name: "James Rodriguez", title: "Head of Partnerships", linkedin: "james-r" },
  { name: "Emily Zhao", title: "VP of Engineering", linkedin: "emily-zhao" },
];

const newsItems = [
  { title: "NovaPay Raises $45M Series B to Expand Embedded Finance Platform", date: "Mar 15, 2025", source: "TechCrunch" },
  { title: "NovaPay Partners with Major Bank to Launch Instant Payouts", date: "Feb 8, 2025", source: "Finextra" },
  { title: "NovaPay Hires Former Stripe Exec as VP of Sales", date: "Jan 22, 2025", source: "LinkedIn News" },
  { title: "NovaPay Named in CB Insights Fintech 250 List", date: "Dec 5, 2024", source: "CB Insights" },
];

export default function AccountResearcherPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [notes, setNotes] = useState("Key insight: NovaPay is aggressively hiring sales team after Series B. VP Sales is new hire from competitor - likely building outbound motion from scratch. Good timing for sales tooling pitch.");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Building2 className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Account Researcher</h1>
          <p className="text-gray-400 text-sm mt-1">Company Dossier &bull; Deep-dive intelligence on target accounts</p>
        </div>
      </div>

      {/* Company Header Card */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-5">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-gold">N</span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-heading font-bold mb-1">{company.name}</h2>
            <p className="text-gray-400 text-sm mb-3">{company.industry} &bull; {company.size}</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {company.location}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <DollarSign className="w-3.5 h-3.5" />
                {company.revenue}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Users className="w-3.5 h-3.5" />
                {company.employees} employees
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                Founded {company.founded}
              </div>
            </div>
          </div>

          <button className="bg-gold-gradient text-black font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition text-sm">
            <Sparkles className="w-4 h-4" />
            Enrich
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium transition relative ${
              activeTab === tab
                ? "text-gold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-gradient" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-8 min-h-[400px]">
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-heading font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" />
                Company Overview
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{company.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Recent Highlights</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-white/5">
                  <Award className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gray-300">Named in CB Insights Fintech 250 for 2025</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-white/5">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Revenue grew 180% YoY to $85M ARR</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-white/5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Hiring 50+ new roles including VP Sales and 12 AEs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Financials" && (
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" />
              Funding History
            </h3>
            <div className="space-y-3">
              {financials.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#111111] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold">S{i === 0 ? "B" : i === 1 ? "A" : "eed"}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.round}</p>
                      <p className="text-xs text-gray-500">Led by {f.lead}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold">{f.amount}</p>
                    <p className="text-xs text-gray-500">{f.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[#111111] rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Raised</span>
                <span className="text-xl font-bold text-gold">$67.5M</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Tech Stack" && (
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gold" />
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map(tech => (
                <span key={tech} className="px-4 py-2 bg-[#111111] border border-white/10 rounded-lg text-sm text-gray-300 hover:border-gold/30 transition cursor-default">
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[#111111] rounded-lg border border-white/5">
              <h4 className="text-sm font-semibold mb-2 text-gray-300">Integration Opportunities</h4>
              <p className="text-xs text-gray-500">Company uses Salesforce and HubSpot - potential CRM integration use case. Also uses Segment for data pipeline.</p>
            </div>
          </div>
        )}

        {activeTab === "Key People" && (
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gold" />
              Key Decision Makers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {keyPeople.map(person => (
                <div key={person.name} className="flex items-center gap-4 p-4 bg-[#111111] rounded-lg border border-white/5 hover:border-gold/20 transition">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-sm font-bold text-gold">{person.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.title}</p>
                  </div>
                  <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition">
                    <Share2 className="w-4 h-4 text-blue-400" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "News" && (
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold" />
              Recent News
            </h3>
            <div className="space-y-3">
              {newsItems.map((item, i) => (
                <div key={i} className="p-4 bg-[#111111] rounded-lg border border-white/5 hover:border-gold/20 transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm mb-1">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.source}</span>
                        <span>&bull;</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Notes */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-heading font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold" />
          Intelligence Notes
        </h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          className="w-full bg-[#111111] border border-white/10 rounded-lg p-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gold/40 transition resize-none"
          placeholder="Add notes about this account..."
        />
      </div>
    </div>
  );
}
