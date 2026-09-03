"use client";

import { useState } from "react";
import {
  Target, CheckCircle2, XCircle, Minus, Lightbulb, Calendar,
  Video, BookOpen, FileText, Sparkles, TrendingDown, TrendingUp,
  DollarSign, Percent, Zap, Eye, Users, Layers,
} from "lucide-react";

type Coverage = "covered" | "partial" | "gap";

interface TopicRow {
  id: string;
  topic: string;
  replyRate: number; // outbound reply rate %
  conversations: number;
  coverage: Coverage;
  content: string;
  contentStat: string;
}

const TOPICS: TopicRow[] = [
  { id: "t1", topic: "AI SDR workflows", replyRate: 9.1, conversations: 142, coverage: "covered", content: "Blog: \u201C5 AI SDR Plays for RevOps Teams\u201D", contentStat: "2.4K views · 31 demo requests" },
  { id: "t2", topic: "LinkedIn outreach compliance", replyRate: 6.8, conversations: 96, coverage: "gap", content: "—", contentStat: "no inbound coverage" },
  { id: "t3", topic: "Cold email deliverability", replyRate: 5.2, conversations: 74, coverage: "partial", content: "Guide: \u201CInbox Placement in 2026\u201D", contentStat: "1.1K downloads · low ranking" },
  { id: "t4", topic: "Signal-based prospecting", replyRate: 11.3, conversations: 201, coverage: "gap", content: "—", contentStat: "no inbound coverage" },
  { id: "t5", topic: "Pipeline forecasting", replyRate: 4.1, conversations: 58, coverage: "covered", content: "Webinar: \u201CForecasting Without Spreadsheets\u201D", contentStat: "312 registrants · 19 SQLs" },
  { id: "t6", topic: "Multi-threading enterprise deals", replyRate: 7.4, conversations: 88, coverage: "gap", content: "—", contentStat: "no inbound coverage" },
  { id: "t7", topic: "Sales engagement metrics", replyRate: 3.9, conversations: 47, coverage: "gap", content: "—", contentStat: "no inbound coverage" },
  { id: "t8", topic: "Buyer intent data", replyRate: 8.6, conversations: 117, coverage: "covered", content: "Blog series: \u201CIntent Signals Decoded\u201D", contentStat: "1.8K views · 22 newsletter adds" },
];

interface GapCard {
  id: string;
  topic: string;
  priority: "High" | "Medium" | "Low";
  recommendation: string;
  potential: string;
  brief: { format: string; hook: string; angle: string; cta: string };
}

const GAPS: GapCard[] = [
  {
    id: "g1",
    topic: "Signal-based prospecting",
    priority: "High",
    recommendation: "Your #1 outbound performer (11.3% replies, 201 conversations) has zero inbound surface. Build a 6-part X thread series + PDF template pack — highest ROI content bet this quarter.",
    potential: "~140 inbound leads/quarter",
    brief: {
      format: "6-part X thread + downloadable template pack",
      hook: "The 11 signals that appear 3 days before a company becomes buyable",
      angle: "Use anonymized swarm data — \u201Cwe scanned 40K accounts, here's what preceded buying behavior\u201D",
      cta: "Template pack download (email gate) → intent-scored nurture track",
    },
  },
  {
    id: "g2",
    topic: "LinkedIn outreach compliance",
    priority: "High",
    recommendation: "96 conversations reference compliance fears, but no content de-risks it. Publish the definitive 2026 compliance playbook — highly citable, strong SEO capture for a nervous buyer query.",
    potential: "~90 inbound leads/quarter",
    brief: {
      format: "Long-form guide + weekly policy-update newsletter",
      hook: "Everything legal actually said about LinkedIn DM limits (we asked)",
      angle: "Interview-style credibility: cite platform ToS, not opinions — link back to agent guardrails",
      cta: "Compliance checklist download → demo of guardrail settings",
    },
  },
  {
    id: "g3",
    topic: "Multi-threading enterprise deals",
    priority: "Medium",
    recommendation: "88 conversations on enterprise buying committees with no supporting content. A Modulr-style case study (video + written) would arm champions in exactly these deals.",
    potential: "~55 inbound leads/quarter",
    brief: {
      format: "Customer case study — video + companion post",
      hook: "How Modulr got 7 stakeholders to yes in 23 days",
      angle: "Map each stakeholder's objection to the artifact that resolved it",
      cta: "Meeting-qualifier teardown video → book a committee-mapping session",
    },
  },
  {
    id: "g4",
    topic: "Sales engagement metrics",
    priority: "Low",
    recommendation: "Lower outbound volume (47 conversations), but benchmark content compounds authority. Ship an annual engagement benchmarks report from aggregated, anonymized swarm data.",
    potential: "~30 inbound leads/quarter",
    brief: {
      format: "Annual benchmarks report (interactive)",
      hook: "The 2026 Sales Engagement Benchmarks: 2,658 pipelines, decoded",
      angle: "Own the data category — nobody else has this corpus",
      cta: "Report download → annual benchmark subscription list",
    },
  },
];

const CALENDAR = [
  { topic: "Signal-based prospecting — thread series", format: "6-part X thread", date: "Sep 18", status: "Drafting" },
  { topic: "LinkedIn compliance playbook 2026", format: "Long-form guide", date: "Sep 25", status: "Scheduled" },
  { topic: "Multi-threading case study (Modulr)", format: "Video + post", date: "Oct 2", status: "Idea" },
  { topic: "Signal-based template pack", format: "Lead magnet PDF", date: "Oct 9", status: "Idea" },
  { topic: "Engagement benchmarks report", format: "Annual report", date: "Oct 23", status: "Outline" },
];

const COVERAGE_META: Record<Coverage, { label: string; icon: typeof CheckCircle2; text: string; chip: string }> = {
  covered: { label: "Covered", icon: CheckCircle2, text: "text-emerald-400", chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25" },
  partial: { label: "Partial", icon: Minus, text: "text-amber-300", chip: "bg-amber-400/10 text-amber-300 border-amber-400/25" },
  gap: { label: "Gap", icon: XCircle, text: "text-rose-400", chip: "bg-rose-400/10 text-rose-300 border-rose-400/25" },
};

const PRIORITY_STYLES = {
  High: "bg-rose-400/10 text-rose-300 border-rose-400/25",
  Medium: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  Low: "bg-sky-400/10 text-sky-300 border-sky-400/25",
};

export default function InboundStrategistPage() {
  const [coverageFilter, setCoverageFilter] = useState<Coverage | "all">("all");
  const [activeBrief, setActiveBrief] = useState<string | null>(null);

  const rows = TOPICS.filter((t) => coverageFilter === "all" || t.coverage === coverageFilter);

  const gapCount = TOPICS.filter((t) => t.coverage === "gap").length;
  const coveredCount = TOPICS.filter((t) => t.coverage === "covered").length;

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <Target className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Inbound Strategist</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Turns outbound wins into inbound demand — {gapCount} uncovered topics worth ~$412K in pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5">
          <Layers className="h-4 w-4 text-gold" />
          <p className="text-xs text-gray-400">
            <span className="font-bold text-white">{TOPICS.length} topics</span> analyzed · {coveredCount} covered · {gapCount} gaps
          </p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Outbound Success → Inbound Coverage</h2>
          <div className="flex items-center gap-1.5">
            {(["all", "covered", "partial", "gap"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCoverageFilter(f)}
                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold capitalize transition-all ${
                  coverageFilter === f ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 text-gray-500 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] items-center gap-2 px-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400/90">Outbound Success Topics</p>
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Match</p>
          <p className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gold/90">Inbound Content Coverage</p>
        </div>

        <div className="space-y-2.5">
          {rows.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 text-center text-xs text-gray-500">No topics in this bucket.</p>
          )}
          {rows.map((t) => {
            const meta = COVERAGE_META[t.coverage];
            const Icon = meta.icon;
            return (
              <div key={t.id} className="grid grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] items-center gap-2">
                {/* Outbound topic */}
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{t.topic}</p>
                    <span className="flex-shrink-0 rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      {t.replyRate}% replies
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Users className="h-3 w-3" />
                    {t.conversations} outbound conversations this quarter
                  </p>
                </div>

                {/* Connector */}
                <div className="relative flex items-center justify-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border bg-[#141414] ${meta.chip}`} title={meta.label}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                {/* Inbound coverage */}
                <div className={`rounded-xl border p-3.5 ${t.coverage === "gap" ? "border-rose-400/15 bg-rose-400/[0.03]" : "border-gold/15 bg-gold/[0.03]"}`}>
                  {t.coverage === "gap" ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium italic text-gray-500">No existing content</p>
                      <span className="rounded-md border border-rose-400/25 bg-rose-400/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">GAP</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{t.content}</p>
                        <span className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${meta.chip}`}>{meta.label}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Eye className="h-3 w-3" />
                        {t.contentStat}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap cards */}
      <h2 className="mb-3 text-sm font-bold text-white">Identified Gaps — {GAPS.length} Uncovered Topics</h2>
      <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {GAPS.map((g) => {
          const open = activeBrief === g.id;
          return (
            <div
              key={g.id}
              className={`rounded-xl border p-5 transition-all duration-200 ${
                open ? "border-gold/35 bg-gold/[0.04] shadow-[0_0_18px_rgba(212,175,55,0.06)]" : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">{g.topic}</p>
                <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[g.priority]}`}>
                  {g.priority} priority
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{g.recommendation}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gold">
                  <Zap className="h-3 w-3" />
                  Potential: {g.potential}
                </span>
                <button
                  onClick={() => setActiveBrief(open ? null : g.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  <Sparkles className="h-3 w-3" />
                  {open ? "Hide brief" : "Content brief"}
                </button>
              </div>

              {open && (
                <div className="mt-3 space-y-2 rounded-xl border border-gold/20 bg-[#141414] p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                    <Lightbulb className="h-3 w-3" /> AI-generated content brief
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Format</p><p className="mt-0.5 text-gray-300">{g.brief.format}</p></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Hook</p><p className="mt-0.5 text-gray-300">{g.brief.hook}</p></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Angle</p><p className="mt-0.5 text-gray-300">{g.brief.angle}</p></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">CTA</p><p className="mt-0.5 text-gray-300">{g.brief.cta}</p></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar + ROI */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Content calendar */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Calendar className="h-4 w-4 text-gold" />
              Content Calendar Suggestions
            </h2>
            <span className="text-[10px] text-gray-500">auto-slotted by gap priority</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Topic</th>
                  <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Suggested Format</th>
                  <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Target Date</th>
                  <th className="pb-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {CALENDAR.map((c) => (
                  <tr key={c.topic} className="group border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-xs font-medium text-gray-200">
                        {c.format.includes("thread") ? <Layers className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                        : c.format.includes("Video") ? <Video className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                        : c.format.includes("report") ? <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                        : <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-gold" />}
                        {c.topic}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{c.format}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-white">{c.date}</td>
                    <td className="py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        c.status === "Scheduled" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : c.status === "Drafting" ? "border-gold/25 bg-gold/10 text-gold"
                        : c.status === "Outline" ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                        : "border-white/15 bg-white/5 text-gray-400"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROI metrics */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white">Inbound vs Outbound Economics</h2>

          {[
            {
              icon: DollarSign, label: "Cost per Lead",
              inbound: 62, outbound: 148, unit: "$",
              note: "inbound is 58% cheaper",
            },
            {
              icon: Percent, label: "Lead → Meeting Rate",
              inbound: 4.8, outbound: 2.1, unit: "%",
              note: "2.3x higher conversion",
            },
          ].map((m) => {
            const max = Math.max(m.inbound, m.outbound);
            return (
              <div key={m.label} className="rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-xs font-bold text-white">
                    <m.icon className="h-3.5 w-3.5 text-gold" />
                    {m.label}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    <TrendingDown className="mr-1 inline h-3 w-3" />
                    {m.note}
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="font-medium text-gold">Inbound</span>
                      <span className="font-bold text-white">{m.unit}{m.inbound}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${(m.inbound / max) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="font-medium text-gray-400">Outbound</span>
                      <span className="font-bold text-white">{m.unit}{m.outbound}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gray-600" style={{ width: `${(m.outbound / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gold/20 bg-gold/[0.05] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Content-Sourced Pipeline</p>
              <p className="mt-1.5 text-xl font-extrabold text-white">$312K</p>
              <p className="mt-0.5 text-[10px] text-gray-500">26% of total pipeline</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Content-Influenced Deals</p>
              <p className="mt-1.5 text-xl font-extrabold text-emerald-400">+31%</p>
              <p className="mt-0.5 text-[10px] text-gray-500">larger avg deal size</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
            <TrendingUp className="h-4 w-4 flex-shrink-0 text-gold" />
            <p className="text-[11px] leading-relaxed text-gray-400">
              Closing all {GAPS.length} content gaps is modeled to add <span className="font-bold text-gold">~$412K pipeline</span> over two quarters at current conversion rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
