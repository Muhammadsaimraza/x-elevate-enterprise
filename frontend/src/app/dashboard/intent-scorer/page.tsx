"use client";

import { useState } from "react";
import {
  Gauge, Trophy, TrendingUp, ChevronDown, ChevronUp,
  Zap, Target, Eye, MousePointer, FileText, Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Prospect {
  id: number;
  name: string;
  company: string;
  title: string;
  score: number;
  signals: string[];
  lastActivity: string;
  email: string;
}

const prospects: Prospect[] = [
  { id: 1, name: "Sarah Chen", company: "NovaPay", title: "VP of Sales", score: 94, signals: ["Pricing page visit", "Demo request", "LinkedIn engagement"], lastActivity: "2 hours ago", email: "sarah@novapay.com" },
  { id: 2, name: "Marcus Webb", company: "CloudStack AI", title: "Chief Revenue Officer", score: 88, signals: ["Webinar attended", "Content download", "Email opened 3x"], lastActivity: "5 hours ago", email: "marcus@cloudstack.ai" },
  { id: 3, name: "James O'Brien", company: "CyberVault", title: "VP Sales", score: 82, signals: ["Job change signal", "LinkedIn message sent", "Website revisit"], lastActivity: "1 day ago", email: "james@cybervault.io" },
  { id: 4, name: "Lisa Park", company: "FinEdge", title: "VP of Growth", score: 78, signals: ["Competitor mention", "Industry event", "Email replied"], lastActivity: "1 day ago", email: "lisa@finedge.com" },
  { id: 5, name: "Priya Sharma", company: "HealthGrid", title: "Head of Growth", score: 72, signals: ["Content engagement", "LinkedIn connection", "Case study viewed"], lastActivity: "2 days ago", email: "priya@healthgrid.co" },
  { id: 6, name: "Andre Williams", company: "ScaleOps", title: "CEO", score: 68, signals: ["Funding signal", "Social mention", "Website visit"], lastActivity: "3 days ago", email: "andre@scaleops.io" },
  { id: 7, name: "Tom Erikson", company: "DataForge", title: "Sales Director", score: 61, signals: ["Email opened", "Blog read", "LinkedIn profile view"], lastActivity: "3 days ago", email: "tom@dataforge.com" },
  { id: 8, name: "Rachel Kim", company: "MedTech Solutions", title: "Regional Sales Director", score: 55, signals: ["Email clicked", "Website visit"], lastActivity: "4 days ago", email: "rachel@medtech.com" },
  { id: 9, name: "Diana Torres", company: "EduPlatform", title: "Head of Partnerships", score: 47, signals: ["Email opened", "LinkedIn connection accepted"], lastActivity: "5 days ago", email: "diana@eduplatform.co" },
  { id: 10, name: "Kevin Zhang", company: "LogiChain", title: "Account Executive", score: 42, signals: ["Content download", "Newsletter open"], lastActivity: "1 week ago", email: "kevin@logichain.com" },
  { id: 11, name: "Olivia Martinez", company: "RetailFlow", title: "VP Sales", score: 35, signals: ["Email opened"], lastActivity: "1 week ago", email: "olivia@retailflow.com" },
  { id: 12, name: "Daniel Brown", company: "CloudSync", title: "Sales Manager", score: 22, signals: ["Newsletter subscription"], lastActivity: "2 weeks ago", email: "daniel@cloudsync.io" },
];

const distributionData = [
  { range: "0-20", count: 1, color: "#EF4444" },
  { range: "21-40", count: 2, color: "#F59E0B" },
  { range: "41-60", count: 3, color: "#EAB308" },
  { range: "61-80", count: 3, color: "#22C55E" },
  { range: "81-100", count: 3, color: "#D4AF37" },
];

export default function IntentScorerPage() {
  const [threshold, setThreshold] = useState(70);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "name">("score");

  const filtered = prospects
    .filter(p => p.score >= threshold)
    .sort((a, b) => sortBy === "score" ? b.score - a.score : a.name.localeCompare(b.name));

  const scoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-500/15 text-green-400 border-green-500/20";
    if (score >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    return "bg-red-500/15 text-red-400 border-red-500/20";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400">Score: {label}</p>
          <p className="text-sm font-bold text-white">{payload[0].value} prospects</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Gauge className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Intent Scorer</h1>
          <p className="text-gray-400 text-sm mt-1">Scoring Leaderboard &bull; {filtered.length} prospects above threshold</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Score Distribution
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />High</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} barSize={50}>
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Minimum Score Threshold</span>
          <span className="text-lg font-bold text-gold">{threshold}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold"
          style={{
            background: `linear-gradient(to right, #D4AF37 ${threshold}%, rgba(255,255,255,0.1) ${threshold}%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Show all</span>
          <span>High intent only</span>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">Sort by:</span>
        <button
          onClick={() => setSortBy("score")}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${sortBy === "score" ? "bg-gold/10 border-gold/30 text-gold" : "border-white/10 text-gray-400 hover:border-white/20"}`}
        >
          Score
        </button>
        <button
          onClick={() => setSortBy("name")}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${sortBy === "name" ? "bg-gold/10 border-gold/30 text-gold" : "border-white/10 text-gray-400 hover:border-white/20"}`}
        >
          Name
        </button>
      </div>

      {/* Prospect List */}
      <div className="space-y-3">
        {filtered.map((prospect, i) => (
          <div key={prospect.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div
              onClick={() => setExpandedId(expandedId === prospect.id ? null : prospect.id)}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 hover:border-gold/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 h-8 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gold">{prospect.name.split(" ").map(n => n[0]).join("")}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{prospect.name}</span>
                    <span className="text-gray-600 text-xs">&bull;</span>
                    <span className="text-gray-400 text-xs">{prospect.title} at {prospect.company}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {prospect.signals.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div className={`px-3 py-1.5 rounded-lg border font-bold text-lg ${scoreBadge(prospect.score)}`}>
                  {prospect.score}
                </div>

                {/* Expand Icon */}
                {expandedId === prospect.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedId === prospect.id && (
              <div className="mt-1 bg-[#111111] border border-white/10 rounded-xl p-5 ml-12 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#0A0A0A] rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Eye className="w-3.5 h-3.5" />
                      Last Activity
                    </div>
                    <p className="text-sm font-medium">{prospect.lastActivity}</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Target className="w-3.5 h-3.5" />
                      Intent Signals
                    </div>
                    <p className="text-sm font-medium">{prospect.signals.length} detected</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MousePointer className="w-3.5 h-3.5" />
                      Email
                    </div>
                    <p className="text-sm font-medium truncate">{prospect.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-gold-gradient text-black font-semibold px-4 py-2 rounded-lg text-xs hover:opacity-90 transition flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Send to Outreach
                  </button>
                  <button className="border border-white/10 text-gray-400 px-4 py-2 rounded-lg text-xs hover:border-white/20 hover:text-white transition flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    View Full Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>No prospects meet the threshold of {threshold}.</p>
          <p className="text-xs mt-1">Try lowering the minimum score.</p>
        </div>
      )}
    </div>
  );
}
