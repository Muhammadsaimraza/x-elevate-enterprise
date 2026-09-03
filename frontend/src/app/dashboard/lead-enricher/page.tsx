"use client";

import { useState } from "react";
import {
  DatabaseZap, CheckCircle2, Clock, XCircle, Search,
  Download, RefreshCw, Filter, ChevronDown, Mail,
  Phone, Share2, MoreVertical, Play, Pause
} from "lucide-react";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: "verified" | "pending" | "missing";
  phone: "verified" | "pending" | "missing";
  linkedin: "verified" | "pending" | "missing";
  enrichment: number;
  title: string;
}

const initialLeads: Lead[] = [
  { id: 1, name: "Sarah Chen", company: "NovaPay", email: "verified", phone: "verified", linkedin: "verified", enrichment: 100, title: "VP of Sales" },
  { id: 2, name: "Marcus Webb", company: "CloudStack AI", email: "verified", phone: "pending", linkedin: "verified", enrichment: 66, title: "Chief Revenue Officer" },
  { id: 3, name: "Priya Sharma", company: "HealthGrid", email: "verified", phone: "missing", linkedin: "verified", enrichment: 66, title: "Head of Growth" },
  { id: 4, name: "Tom Erikson", company: "DataForge", email: "pending", phone: "pending", linkedin: "verified", enrichment: 33, title: "Sales Director" },
  { id: 5, name: "Lisa Park", company: "FinEdge", email: "verified", phone: "verified", linkedin: "pending", enrichment: 66, title: "VP of Growth" },
  { id: 6, name: "Andre Williams", company: "ScaleOps", email: "verified", phone: "missing", linkedin: "missing", enrichment: 33, title: "CEO" },
  { id: 7, name: "Rachel Kim", company: "MedTech Solutions", email: "verified", phone: "verified", linkedin: "verified", enrichment: 100, title: "Regional Sales Director" },
  { id: 8, name: "James O'Brien", company: "CyberVault", email: "pending", phone: "missing", linkedin: "verified", enrichment: 33, title: "VP Sales" },
  { id: 9, name: "Diana Torres", company: "EduPlatform", email: "verified", phone: "pending", linkedin: "pending", enrichment: 33, title: "Head of Partnerships" },
  { id: 10, name: "Kevin Zhang", company: "LogiChain", email: "verified", phone: "verified", linkedin: "verified", enrichment: 100, title: "Account Executive" },
];

const statusIcon = (status: "verified" | "pending" | "missing") => {
  switch (status) {
    case "verified": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case "pending": return <Clock className="w-4 h-4 text-amber-400" />;
    case "missing": return <XCircle className="w-4 h-4 text-red-400" />;
  }
};

export default function LeadEnricherPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [enriching, setEnriching] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const completeCount = leads.filter(l => l.enrichment === 100).length;
  const totalLeads = leads.length;
  const completionPct = Math.round((completeCount / totalLeads) * 100);

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === totalLeads) setSelected([]);
    else setSelected(leads.map(l => l.id));
  };

  const handleEnrichAll = () => {
    setEnriching(true);
    setTimeout(() => setEnriching(false), 2000);
  };

  const filtered = leads.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())
  );

  const progressColor = (pct: number) => {
    if (pct === 100) return "bg-green-400";
    if (pct >= 50) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <DatabaseZap className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Lead Enricher</h1>
          <p className="text-gray-400 text-sm mt-1">Data Enrichment Grid &bull; {completeCount}/{totalLeads} leads fully enriched</p>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 transition"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition"
        >
          <Filter className="w-4 h-4" />
          Filter
          <ChevronDown className={`w-3 h-3 transition ${showFilter ? "rotate-180" : ""}`} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={handleEnrichAll}
          disabled={enriching}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-black font-semibold rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {enriching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Enrich All
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Enrichment Progress</span>
          <span className="text-sm font-semibold text-gold">{completionPct}% complete</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-gradient rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            {leads.filter(l => l.enrichment === 100).length} Verified
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {leads.filter(l => l.enrichment > 0 && l.enrichment < 100).length} In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            {leads.filter(l => l.enrichment === 0).length} Missing
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === totalLeads}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-white/20 bg-transparent accent-gold"
                  />
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Mail className="w-4 h-4 inline" /> Email
                </th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Phone className="w-4 h-4 inline" /> Phone
                </th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Share2 className="w-4 h-4 inline" /> LinkedIn
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrichment</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-b border-white/5 hover:bg-white/[0.02] transition animate-fade-in-up ${selected.includes(lead.id) ? "bg-gold/[0.03]" : ""}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="w-4 h-4 rounded border-white/20 bg-transparent accent-gold"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.title}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{lead.company}</td>
                  <td className="p-4 text-center">{statusIcon(lead.email)}</td>
                  <td className="p-4 text-center">{statusIcon(lead.phone)}</td>
                  <td className="p-4 text-center">{statusIcon(lead.linkedin)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressColor(lead.enrichment)}`}
                          style={{ width: `${lead.enrichment}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{lead.enrichment}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="p-1 hover:bg-white/5 rounded transition">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      {selected.length > 0 && (
        <div className="mt-4 flex items-center justify-between bg-[#1A1A1A] border border-gold/20 rounded-xl p-4">
          <span className="text-sm text-gray-400">{selected.length} lead{selected.length > 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-enrich
            </button>
            <button className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export Selected
            </button>
            <button className="bg-gold-gradient text-black font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">
              Enrich Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
