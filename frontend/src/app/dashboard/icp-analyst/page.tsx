"use client";

import { useState } from "react";
import {
  Crosshair, Filter, Download, Check, X, SlidersHorizontal,
  Building2, Users, DollarSign, Layers, Globe, RotateCcw,
  ChevronDown, Target, TrendingUp,
} from "lucide-react";

/* ---------------------------------- Data ---------------------------------- */

const INDUSTRIES = ["SaaS", "FinTech", "HealthTech", "E-Commerce", "Cybersecurity", "EdTech"];

const SIZE_OPTIONS = ["10-50", "51-200", "201-1000", "1000+"];
const SIZE_HINTS: Record<string, string> = {
  "10-50": "Startup",
  "51-200": "SMB",
  "201-1000": "Mid-Market",
  "1000+": "Enterprise",
};

const REVENUE_OPTIONS = ["$1M-$5M", "$5M-$20M", "$20M-$100M", "$100M+"];

const TECH_TAGS = ["React", "AWS", "Python", "Node.js", "Salesforce", "HubSpot", "GCP", "Azure", "Kubernetes", "Terraform"];

const GEOGRAPHIES = ["North America", "Europe", "APAC", "LATAM", "Middle East & Africa"];

const ICP_THRESHOLD = 70;

interface Lead {
  id: number;
  company: string;
  domain: string;
  industry: string;
  size: string;
  revenue: string;
  techStack: string[];
  geography: string;
}

const LEADS: Lead[] = [
  { id: 1, company: "NovaPay", domain: "novapay.com", industry: "FinTech", size: "51-200", revenue: "$5M-$20M", techStack: ["React", "AWS", "Python"], geography: "North America" },
  { id: 2, company: "CloudStack AI", domain: "cloudstack.ai", industry: "SaaS", size: "201-1000", revenue: "$20M-$100M", techStack: ["React", "AWS", "Node.js"], geography: "North America" },
  { id: 3, company: "DataForge", domain: "dataforge.com", industry: "SaaS", size: "201-1000", revenue: "$20M-$100M", techStack: ["React", "AWS"], geography: "North America" },
  { id: 4, company: "CyberVault", domain: "cybervault.io", industry: "Cybersecurity", size: "201-1000", revenue: "$20M-$100M", techStack: ["AWS", "Python", "Terraform"], geography: "North America" },
  { id: 5, company: "HealthGrid", domain: "healthgrid.co", industry: "HealthTech", size: "51-200", revenue: "$5M-$20M", techStack: ["React", "Python"], geography: "Europe" },
  { id: 6, company: "ScaleOps", domain: "scaleops.io", industry: "SaaS", size: "1000+", revenue: "$100M+", techStack: ["React", "AWS", "Kubernetes"], geography: "North America" },
  { id: 7, company: "LogiChain", domain: "logichain.com", industry: "FinTech", size: "201-1000", revenue: "$100M+", techStack: ["Python", "Salesforce"], geography: "LATAM" },
  { id: 8, company: "EduPlatform", domain: "eduplatform.co", industry: "EdTech", size: "51-200", revenue: "$5M-$20M", techStack: ["Python", "HubSpot"], geography: "APAC" },
  { id: 9, company: "FinEdge", domain: "finedge.com", industry: "FinTech", size: "10-50", revenue: "$1M-$5M", techStack: ["React", "GCP"], geography: "Europe" },
  { id: 10, company: "RetailFlow", domain: "retailflow.com", industry: "E-Commerce", size: "1000+", revenue: "$100M+", techStack: ["React", "HubSpot"], geography: "North America" },
];

const DEFAULT_FILTERS = {
  industries: ["SaaS", "FinTech"],
  sizes: ["51-200", "201-1000"],
  revenues: ["$5M-$20M", "$20M-$100M"],
  tech: ["React", "AWS"],
  geography: "North America",
};

const DEFAULT_WEIGHTS = { industry: 30, size: 20, revenue: 20, tech: 15, geography: 15 };

const INDUSTRY_DOTS: Record<string, string> = {
  SaaS: "bg-blue-400",
  FinTech: "bg-gold",
  HealthTech: "bg-green-400",
  "E-Commerce": "bg-pink-400",
  Cybersecurity: "bg-red-400",
  EdTech: "bg-purple-400",
};

/* ------------------------------- Components ------------------------------- */

function FilterSection({
  icon: Icon, title, count, open, onToggle, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-5 py-4 hover:bg-white/[0.02] transition text-left"
      >
        <Icon className="w-4 h-4 text-gold/80 flex-shrink-0" />
        <span className="text-sm font-semibold text-gray-200 flex-1">{title}</span>
        {count > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
            {count}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function WeightSlider({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold text-gold w-8 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="icp-slider w-full cursor-pointer"
        style={{ background: `linear-gradient(to right, #D4AF37 ${value}%, rgba(255,255,255,0.08) ${value}%)` }}
      />
    </div>
  );
}

function CriterionChip({ label, pass, title }: { label: string; pass: boolean; title: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border whitespace-nowrap ${
        pass
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      {pass ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : <X className="w-2.5 h-2.5" strokeWidth={3} />}
      {label}
    </span>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function ICPAnalystPage() {
  const [industries, setIndustries] = useState<string[]>(DEFAULT_FILTERS.industries);
  const [sizes, setSizes] = useState<string[]>(DEFAULT_FILTERS.sizes);
  const [revenues, setRevenues] = useState<string[]>(DEFAULT_FILTERS.revenues);
  const [selectedTech, setSelectedTech] = useState<string[]>(DEFAULT_FILTERS.tech);
  const [geography, setGeography] = useState<string>(DEFAULT_FILTERS.geography);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [matchesOnly, setMatchesOnly] = useState(false);
  const [exported, setExported] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    industry: true, size: true, revenue: true, tech: true, geo: true, weights: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleValue = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const totalWeight =
    weights.industry + weights.size + weights.revenue + weights.tech + weights.geography;

  const activeFilterCount =
    industries.length + sizes.length + revenues.length + selectedTech.length +
    (geography !== "All Regions" ? 1 : 0);

  /* Live ICP scoring: criterion passes x weights, auto-normalized */
  const scored = LEADS.map((lead) => {
    const criteria = {
      industry: industries.length === 0 || industries.includes(lead.industry),
      size: sizes.length === 0 || sizes.includes(lead.size),
      revenue: revenues.length === 0 || revenues.includes(lead.revenue),
      tech: selectedTech.length === 0 || selectedTech.some((t) => lead.techStack.includes(t)),
      geography: geography === "All Regions" || lead.geography === geography,
    };
    const raw =
      (criteria.industry ? weights.industry : 0) +
      (criteria.size ? weights.size : 0) +
      (criteria.revenue ? weights.revenue : 0) +
      (criteria.tech ? weights.tech : 0) +
      (criteria.geography ? weights.geography : 0);
    const score = totalWeight === 0 ? 0 : Math.round((raw / totalWeight) * 100);
    return { ...lead, criteria, score, passing: score >= ICP_THRESHOLD };
  });

  const matches = scored.filter((s) => Object.values(s.criteria).every(Boolean));
  const passingCount = scored.filter((s) => s.passing).length;
  const displayed = (matchesOnly ? matches : scored).slice().sort((a, b) => b.score - a.score);
  const avgScore = displayed.length
    ? Math.round(displayed.reduce((sum, s) => sum + s.score, 0) / displayed.length)
    : 0;

  const resetAll = () => {
    setIndustries(DEFAULT_FILTERS.industries);
    setSizes(DEFAULT_FILTERS.sizes);
    setRevenues(DEFAULT_FILTERS.revenues);
    setSelectedTech(DEFAULT_FILTERS.tech);
    setGeography(DEFAULT_FILTERS.geography);
    setWeights(DEFAULT_WEIGHTS);
    setMatchesOnly(false);
  };

  const handleExport = () => {
    const header = ["Company", "Industry", "Size", "Revenue", "Geography", "Tech Stack", "ICP Score", "Status"];
    const rows = displayed.map((l) => [
      l.company, l.industry, l.size, l.revenue, l.geography,
      l.techStack.join(" | "), l.score, l.passing ? "Pass" : "Fail",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "icp-matches.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const scoreBadge = (score: number) => {
    if (score >= ICP_THRESHOLD) return "bg-green-500/15 text-green-400 border-green-500/20";
    if (score >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    return "bg-red-500/15 text-red-400 border-red-500/20";
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <style>{`
        .icp-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          outline: none;
        }
        .icp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F4D03F, #D4AF37, #B8860B);
          border: 2px solid #0A0A0A;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.4), 0 2px 6px rgba(0, 0, 0, 0.5);
          cursor: pointer;
        }
        .icp-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #D4AF37;
          border: 2px solid #0A0A0A;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.4);
          cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Crosshair className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">ICP Analyst</h1>
          <p className="text-gray-400 text-sm mt-1">
            Ideal Customer Profile Builder &bull; {matches.length} of {LEADS.length} companies match your ICP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        {/* ------------------------------ Left: Filter Panel ------------------------------ */}
        <aside className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden lg:sticky lg:top-8">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">ICP Filters</p>
              <p className="text-[11px] text-gray-500">{activeFilterCount} active</p>
            </div>
            <button
              onClick={resetAll}
              title="Reset to default ICP definition"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:border-gold/30 hover:bg-gold/5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Industry */}
          <FilterSection
            icon={Building2}
            title="Industry"
            count={industries.length}
            open={openSections.industry}
            onToggle={() => toggleSection("industry")}
          >
            <div className="grid grid-cols-2 gap-1">
              {INDUSTRIES.map((ind) => {
                const checked = industries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => setIndustries((prev) => toggleValue(prev, ind))}
                    className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                        checked ? "bg-gold-gradient border-gold" : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                    </span>
                    <span className={`text-sm transition ${checked ? "text-white" : "text-gray-400"}`}>{ind}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Company Size */}
          <FilterSection
            icon={Users}
            title="Company Size"
            count={sizes.length}
            open={openSections.size}
            onToggle={() => toggleSection("size")}
          >
            <div className="grid grid-cols-2 gap-2">
              {SIZE_OPTIONS.map((s) => {
                const active = sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizes((prev) => toggleValue(prev, s))}
                    className={`px-3 py-2 rounded-lg border text-left transition ${
                      active ? "bg-gold/10 border-gold/40" : "bg-[#111111] border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${active ? "text-gold" : "text-gray-300"}`}>{s}</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5">{SIZE_HINTS[s]} &bull; employees</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Annual Revenue */}
          <FilterSection
            icon={DollarSign}
            title="Annual Revenue"
            count={revenues.length}
            open={openSections.revenue}
            onToggle={() => toggleSection("revenue")}
          >
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_OPTIONS.map((r) => {
                const active = revenues.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRevenues((prev) => toggleValue(prev, r))}
                    className={`px-3 py-2 rounded-lg border text-left transition ${
                      active ? "bg-gold/10 border-gold/40" : "bg-[#111111] border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${active ? "text-gold" : "text-gray-300"}`}>{r}</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5">ARR band</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Tech Stack */}
          <FilterSection
            icon={Layers}
            title="Tech Stack"
            count={selectedTech.length}
            open={openSections.tech}
            onToggle={() => toggleSection("tech")}
          >
            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map((tag) => {
                const active = selectedTech.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTech((prev) => toggleValue(prev, tag))}
                    className={`px-2.5 py-1 rounded-full text-xs border transition ${
                      active
                        ? "bg-gold-gradient text-black border-transparent font-semibold"
                        : "bg-[#111111] text-gray-400 border-white/10 hover:border-white/25 hover:text-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Geography */}
          <FilterSection
            icon={Globe}
            title="Geography"
            count={geography !== "All Regions" ? 1 : 0}
            open={openSections.geo}
            onToggle={() => toggleSection("geo")}
          >
            <div className="relative">
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                className="w-full appearance-none bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 pr-9 text-sm text-white focus:outline-none focus:border-gold/40 transition cursor-pointer [color-scheme:dark]"
              >
                <option value="All Regions">All Regions</option>
                {GEOGRAPHIES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </FilterSection>

          {/* Scoring Weights */}
          <FilterSection
            icon={SlidersHorizontal}
            title="Scoring Criteria Weights"
            count={0}
            open={openSections.weights}
            onToggle={() => toggleSection("weights")}
          >
            <div className="space-y-4">
              <WeightSlider
                label="Industry Fit"
                value={weights.industry}
                onChange={(v) => setWeights((w) => ({ ...w, industry: v }))}
              />
              <WeightSlider
                label="Company Size"
                value={weights.size}
                onChange={(v) => setWeights((w) => ({ ...w, size: v }))}
              />
              <WeightSlider
                label="Revenue Band"
                value={weights.revenue}
                onChange={(v) => setWeights((w) => ({ ...w, revenue: v }))}
              />
              <WeightSlider
                label="Tech Alignment"
                value={weights.tech}
                onChange={(v) => setWeights((w) => ({ ...w, tech: v }))}
              />
              <WeightSlider
                label="Geography Coverage"
                value={weights.geography}
                onChange={(v) => setWeights((w) => ({ ...w, geography: v }))}
              />
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[11px] text-gray-500">Total weight</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    totalWeight === 100
                      ? "bg-gold/10 text-gold border-gold/20"
                      : totalWeight === 0
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  &Sigma; {totalWeight}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Weights are auto-normalized when they don&apos;t sum to 100. ICP pass threshold is a score of {ICP_THRESHOLD}+.
              </p>
            </div>
          </FilterSection>
        </aside>

        {/* ------------------------------ Right: Results ------------------------------ */}
        <section>
          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-gold" />
                ICP Match Results
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {matches.length} of {LEADS.length} companies match your ICP definition
                {matchesOnly && " \u2014 showing matches only"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMatchesOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition ${
                  matchesOnly
                    ? "bg-gold/10 border-gold/30 text-gold"
                    : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                <Filter className="w-4 h-4" />
                Matches only
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-black font-semibold rounded-lg text-sm hover:opacity-90 transition"
              >
                {exported ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {exported ? "Exported!" : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl bg-[#1A1A1A] border border-gold/20 p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> Matches
              </div>
              <p className="text-2xl font-bold font-heading text-gold mt-1">
                {matches.length}
                <span className="text-sm text-gray-500 font-normal"> / {LEADS.length}</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" /> Passing ICP
              </div>
              <p className="text-2xl font-bold font-heading text-white mt-1">{passingCount}</p>
            </div>
            <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> Avg Score
              </div>
              <p className="text-2xl font-bold font-heading text-white mt-1">{avgScore}</p>
            </div>
            <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider">
                <Crosshair className="w-3.5 h-3.5" /> Pass Rate
              </div>
              <p className="text-2xl font-bold font-heading text-white mt-1">
                {Math.round((passingCount / LEADS.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Results table */}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
            <div className="h-0.5 bg-gold-gradient" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geography</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICP Score</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <Crosshair className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                        <p className="text-gray-400 text-sm">No companies match your current filters</p>
                        <p className="text-xs text-gray-600 mt-1">Adjust or reset your ICP definition</p>
                      </td>
                    </tr>
                  ) : (
                    displayed.map((lead, i) => (
                      <tr
                        key={lead.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition animate-fade-in-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-gold">{initials(lead.company)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{lead.company}</p>
                              <p className="text-xs text-gray-500">{lead.domain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-2 text-gray-300">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INDUSTRY_DOTS[lead.industry]}`} />
                            {lead.industry}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-300">{lead.size}</p>
                          <p className="text-[10px] text-gray-600">{SIZE_HINTS[lead.size]}</p>
                        </td>
                        <td className="p-4 text-gray-300">{lead.revenue}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <Globe className="w-3.5 h-3.5 text-gray-600" />
                            {lead.geography}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg border font-bold ${scoreBadge(lead.score)}`}>
                              {lead.score}
                            </span>
                            <div>
                              <p className={`text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 ${lead.passing ? "text-green-400" : "text-red-400"}`}>
                                {lead.passing ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {lead.passing ? "Pass" : "Fail"}
                              </p>
                              <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    lead.passing ? "bg-green-400" : lead.score >= 50 ? "bg-amber-400" : "bg-red-400"
                                  }`}
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1">
                            <CriterionChip label="Ind" pass={lead.criteria.industry} title="Industry Fit" />
                            <CriterionChip label="Size" pass={lead.criteria.size} title="Company Size" />
                            <CriterionChip label="Rev" pass={lead.criteria.revenue} title="Annual Revenue" />
                            <CriterionChip label="Tech" pass={lead.criteria.tech} title="Tech Stack" />
                            <CriterionChip label="Geo" pass={lead.criteria.geography} title="Geography" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="px-4 py-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-600">
              <span><span className="text-gray-400 font-medium">Ind</span> Industry</span>
              <span><span className="text-gray-400 font-medium">Size</span> Company Size</span>
              <span><span className="text-gray-400 font-medium">Rev</span> Revenue</span>
              <span><span className="text-gray-400 font-medium">Tech</span> Tech Stack</span>
              <span><span className="text-gray-400 font-medium">Geo</span> Geography</span>
              <span className="ml-auto flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> Pass
                <X className="w-3 h-3 text-red-500 ml-2" /> Fail
                <span className="ml-2 text-gray-600">&bull; ICP pass threshold &ge; {ICP_THRESHOLD}</span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
