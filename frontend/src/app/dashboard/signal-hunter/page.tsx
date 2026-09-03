"use client";

import { useState } from "react";
import {
  Radar, Search, Flame, Sun, Snowflake, Clock,
  Briefcase, TrendingUp, Cpu, UserCog, MapPin, X
} from "lucide-react";

type Urgency = "Hot" | "Warm" | "Cold";
type SignalType = "Job Change" | "Funding Round" | "Tech Adoption" | "Leadership Change" | "Expansion";

interface Signal {
  id: number;
  platform: "x" | "linkedin";
  person: string;
  company: string;
  type: SignalType;
  urgency: Urgency;
  timestamp: string;
  description: string;
}

const signals: Signal[] = [
  { id: 1, platform: "linkedin", person: "Sarah Chen", company: "NovaPay", type: "Funding Round", urgency: "Hot", timestamp: "2 min ago", description: "NovaPay announced $45M Series B led by Sequoia. Hiring VP Sales." },
  { id: 2, platform: "x", person: "Marcus Webb", company: "CloudStack AI", type: "Leadership Change", urgency: "Hot", timestamp: "8 min ago", description: "New CRO appointed from Salesforce. Tweeted about 'aggressive outbound strategy'." },
  { id: 3, platform: "linkedin", person: "Priya Sharma", company: "HealthGrid", type: "Expansion", urgency: "Warm", timestamp: "14 min ago", description: "Posted about opening 3 new regional offices and scaling sales team to 50." },
  { id: 4, platform: "x", person: "Tom Erikson", company: "DataForge", type: "Tech Adoption", urgency: "Warm", timestamp: "22 min ago", description: "Announced migration to new CRM platform. Looking for integration partners." },
  { id: 5, platform: "linkedin", person: "Lisa Park", company: "FinEdge", type: "Job Change", urgency: "Hot", timestamp: "31 min ago", description: "Started new role as VP of Growth at FinEdge. Previously at Stripe." },
  { id: 6, platform: "x", person: "Andre Williams", company: "ScaleOps", type: "Funding Round", urgency: "Warm", timestamp: "45 min ago", description: "ScaleOps closes $12M seed. CEO tweets about 'building the GTM engine'." },
  { id: 7, platform: "linkedin", person: "Rachel Kim", company: "MedTech Solutions", type: "Expansion", urgency: "Cold", timestamp: "1 hr ago", description: "Company expanding into European market, hiring regional sales directors." },
  { id: 8, platform: "x", person: "James O'Brien", company: "CyberVault", type: "Leadership Change", urgency: "Hot", timestamp: "1.5 hr ago", description: "New VP Sales hired. Previously scaled Acme Corp from $5M to $50M ARR." },
  { id: 9, platform: "linkedin", person: "Diana Torres", company: "EduPlatform", type: "Tech Adoption", urgency: "Cold", timestamp: "2 hr ago", description: "Posted about evaluating sales engagement platforms for their B2B division." },
  { id: 10, platform: "x", person: "Kevin Zhang", company: "LogiChain", type: "Job Change", urgency: "Warm", timestamp: "3 hr ago", description: "Moved from SDR to AE role at LogiChain. Engaged with outbound content." },
];

const signalTypes: SignalType[] = ["Job Change", "Funding Round", "Tech Adoption", "Leadership Change", "Expansion"];

const stats = {
  "Job Change": { count: 2, color: "text-blue-400" },
  "Funding Round": { count: 2, color: "text-green-400" },
  "Tech Adoption": { count: 2, color: "text-purple-400" },
  "Leadership Change": { count: 2, color: "text-amber-400" },
  "Expansion": { count: 2, color: "text-cyan-400" },
};

export default function SignalHunterPage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<SignalType[]>([]);

  const toggleFilter = (type: SignalType) => {
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
  };

  const filtered = signals.filter(s => {
    if (activeFilters.length > 0 && !activeFilters.includes(s.type)) return false;
    if (search && !s.person.toLowerCase().includes(search.toLowerCase()) && !s.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const urgencyStyle = (u: Urgency) => {
    switch (u) {
      case "Hot": return "bg-red-500/15 text-red-400 border-red-500/20";
      case "Warm": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      case "Cold": return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    }
  };

  const urgencyIcon = (u: Urgency) => {
    switch (u) {
      case "Hot": return <Flame className="w-3.5 h-3.5" />;
      case "Warm": return <Sun className="w-3.5 h-3.5" />;
      case "Cold": return <Snowflake className="w-3.5 h-3.5" />;
    }
  };

  const typeIcon = (t: SignalType) => {
    switch (t) {
      case "Job Change": return UserCog;
      case "Funding Round": return TrendingUp;
      case "Tech Adoption": return Cpu;
      case "Leadership Change": return Briefcase;
      case "Expansion": return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Radar className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Signal Hunter</h1>
          <p className="text-gray-400 text-sm mt-1">Live Radar Feed &bull; Scanning X & LinkedIn for buying signals</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-sm text-gray-400">Live Monitoring</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by person, company, or keyword..."
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {signalTypes.map(type => {
          const Icon = typeIcon(type);
          const active = activeFilters.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition ${
                active
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {type}
            </button>
          );
        })}
        {activeFilters.length > 0 && (
          <button onClick={() => setActiveFilters([])} className="text-xs text-gray-500 hover:text-white transition px-3">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Signal Feed */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No signals match your filters</div>
          ) : filtered.map((signal, i) => (
            <div
              key={signal.id}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 hover:border-gold/20 transition animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Platform Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  signal.platform === "x" ? "bg-white/10" : "bg-blue-500/10"
                }`}>
                  {signal.platform === "x" ? (
                    <span className="text-white font-bold text-sm">𝕏</span>
                  ) : (
                    <span className="text-blue-400 font-bold text-sm">in</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{signal.person}</span>
                    <span className="text-gray-600 text-xs">&bull;</span>
                    <span className="text-gray-400 text-xs">{signal.company}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{signal.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgencyStyle(signal.urgency)} flex items-center gap-1`}>
                      {urgencyIcon(signal.urgency)}
                      {signal.urgency}
                    </span>
                    <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {signal.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-600 text-xs flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {signal.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Side Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 sticky top-8">
            <h3 className="text-sm font-heading font-semibold mb-4 text-gray-300">Signal Statistics</h3>
            <div className="space-y-3">
              {Object.entries(stats).map(([type, data]) => {
                const Icon = typeIcon(type as SignalType);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-400">{type}</span>
                    </div>
                    <span className={`text-sm font-bold ${data.color}`}>{data.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Signals</span>
                <span className="text-lg font-bold text-gold">{signals.length}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Hot Signals</span>
                <span className="text-lg font-bold text-red-400">{signals.filter(s => s.urgency === "Hot").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
