"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Send, CalendarCheck, Trophy, DollarSign,
  Activity, Bell, AlertTriangle, AlertCircle, Info, Pause, Play,
  Download, RefreshCw, Users, Zap, X, Loader2, Check,
  ArrowUpRight, Radio,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";

interface FeedItem {
  id: number;
  agent: string;
  text: string;
  time: string;
  platform: "x" | "linkedin" | "crm" | "internal";
}

const INITIAL_FEED: FeedItem[] = [
  { id: 1, agent: "Signal Hunter", text: "found 3 new leads — enterprise SaaS funding signals", time: "09:41", platform: "x" },
  { id: 2, agent: "Outreach Operator", text: "sent 12 DMs (9 X · 3 LinkedIn) — zero send errors", time: "09:38", platform: "linkedin" },
  { id: 3, agent: "Reply Analyst", text: "classified 4 inbound replies — 2 interested, 1 OOO", time: "09:34", platform: "x" },
  { id: 4, agent: "Intent Scorer", text: "promoted 6 leads above intent 80 — routed to outreach", time: "09:27", platform: "internal" },
  { id: 5, agent: "CRM Synchronizer", text: "synced 128 records to HubSpot — 3 conflicts queued", time: "09:15", platform: "crm" },
  { id: 6, agent: "Objection Handler", text: "countered 5 'budget' objections — 91% playbook match", time: "09:02", platform: "x" },
  { id: 7, agent: "Follow-up Orchestrator", text: "advanced 11 leads to Day-3 touch", time: "08:48", platform: "linkedin" },
  { id: 8, agent: "Meeting Qualifier", text: "BANT-checked 3 prospects — 2 fully qualified", time: "08:30", platform: "linkedin" },
];

const FEED_POOL: Omit<FeedItem, "id" | "time">[] = [
  { agent: "Signal Hunter", text: "detected a hiring-spree signal at Fjordline (7 GTM roles)", platform: "x" },
  { agent: "Cross-Platform Copywriter", text: "generated 8 new DM variants — A/B variant B winning", platform: "x" },
  { agent: "Pipeline Analyst", text: "refreshed Q4 forecast: $1.28M (92% confidence)", platform: "internal" },
  { agent: "Outreach Operator", text: "sent 9 more X DMs — 1 instant reply detected", platform: "x" },
  { agent: "Lead Enricher", text: "enriched 22 records — 100% email coverage achieved", platform: "crm" },
  { agent: "Reply Analyst", text: "flagged 1 negative reply — auto-suppressed for 30 days", platform: "linkedin" },
  { agent: "Meeting Qualifier", text: "booked 2 meetings from qualified queue", platform: "linkedin" },
  { agent: "ICP Analyst", text: "tightened ICP scoring — removed 14 low-fit accounts", platform: "internal" },
  { agent: "Follow-up Orchestrator", text: "paused 3 sequences — replies detected mid-cadence", platform: "x" },
];

interface Alert {
  id: number;
  severity: Severity;
  title: string;
  detail: string;
  time: string;
}

const INITIAL_ALERTS: Alert[] = [
  { id: 1, severity: "critical", title: "Outreach Operator hit LinkedIn send cap", detail: "100/100 InMails used today. X channel unaffected — auto-rebalanced.", time: "09:22" },
  { id: 2, severity: "critical", title: "Lead Enricher API rate limit", detail: "14 records failed enrichment (429s). Retry queue engaged — ETA 25 min.", time: "09:05" },
  { id: 3, severity: "warning", title: "4 leads stalled past Day 14", detail: "Follow-up Orchestrator flagged no-reply leads. Breakup touch queued.", time: "08:47" },
  { id: 4, severity: "warning", title: "Q4 coverage below target", detail: "Pipeline coverage at 2.1x vs 3.0x target. Recommend +300 sourced leads this week.", time: "08:15" },
  { id: 5, severity: "info", title: "Nightly CRM sync completed", detail: "1,284 records updated · 0 failures · 3 conflicts pending review.", time: "02:00" },
  { id: 6, severity: "info", title: "Forecast updated", detail: "Pipeline Analyst raised Q4 forecast by $64K on new qualified pipeline.", time: "07:40" },
];

const SEVERITY_META: Record<Severity, { label: string; icon: typeof AlertTriangle; badge: string; dot: string }> = {
  critical: { label: "Critical", icon: AlertTriangle, badge: "bg-rose-400/10 text-rose-300 border-rose-400/25", dot: "bg-rose-400" },
  warning: { label: "Warning", icon: AlertCircle, badge: "bg-amber-400/10 text-amber-300 border-amber-400/25", dot: "bg-amber-400" },
  info: { label: "Info", icon: Info, badge: "bg-sky-400/10 text-sky-300 border-sky-400/25", dot: "bg-sky-400" },
};

type AgentStatus = "active" | "idle" | "error";

interface AgentHealth {
  name: string;
  status: AgentStatus;
  tasks: number;
  success: number;
  note: string;
}

const AGENTS: AgentHealth[] = [
  { name: "Head of Sales", status: "active", tasks: 214, success: 97, note: "Coordinating 12 active workflows" },
  { name: "Signal Hunter", status: "active", tasks: 341, success: 99, note: "Scanning X + LinkedIn firehose" },
  { name: "ICP Analyst", status: "active", tasks: 88, success: 95, note: "Refining Tech-Growth 50-500 segment" },
  { name: "Account Researcher", status: "idle", tasks: 46, success: 93, note: "Queue empty — next batch 11:00" },
  { name: "Lead Enricher", status: "error", tasks: 61, success: 77, note: "API rate limit — retry queue engaged" },
  { name: "Intent Scorer", status: "active", tasks: 527, success: 98, note: "Model v3.2 — 82% precision" },
  { name: "Copywriter", status: "active", tasks: 189, success: 96, note: "Variant B winning reply-rate test" },
  { name: "Outreach Operator", status: "active", tasks: 403, success: 100, note: "X channel healthy · LinkedIn capped" },
  { name: "Reply Analyst", status: "active", tasks: 176, success: 94, note: "Median classification: 1.8s" },
  { name: "Objection Handler", status: "active", tasks: 92, success: 91, note: "Price category hot this week" },
  { name: "Follow-up Orch.", status: "active", tasks: 231, success: 99, note: "247 leads across 12 cadences" },
  { name: "Meeting Qualifier", status: "idle", tasks: 38, success: 92, note: "Awaiting next qualification batch" },
  { name: "Pipeline Analyst", status: "active", tasks: 61, success: 97, note: "Forecast refresh every 15 min" },
  { name: "Sales Manager", status: "active", tasks: 1, success: 100, note: "This command center — all systems reporting" },
  { name: "Inbound Strategist", status: "idle", tasks: 24, success: 90, note: "Nightly gap-analysis at 03:00" },
  { name: "CRM Synchronizer", status: "active", tasks: 418, success: 98, note: "3 field conflicts pending review" },
];

const STATUS_META: Record<AgentStatus, { dot: string; label: string; text: string; border: string }> = {
  active: { dot: "bg-emerald-400", label: "Active", text: "text-emerald-400", border: "border-white/10" },
  idle: { dot: "bg-amber-400", label: "Idle", text: "text-amber-300", border: "border-white/10" },
  error: { dot: "bg-rose-400", label: "Error", text: "text-rose-400", border: "border-rose-400/40" },
};

const KPIS = [
  { icon: Send, label: "Total Outreach", value: "4,827", delta: "+12% MoM", accent: "text-sky-300" },
  { icon: CalendarCheck, label: "Meetings Booked", value: "86", delta: "+23% MoM", accent: "text-gold" },
  { icon: Trophy, label: "Deals Closed", value: "19", delta: "+3 MoM", accent: "text-emerald-400" },
  { icon: DollarSign, label: "Revenue", value: "$539.6K", delta: "+18% MoM", accent: "text-gold" },
];

export default function SalesManagerPage() {
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [paused, setPaused] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>("Lead Enricher");
  const [exportState, setExportState] = useState<"idle" | "working" | "done">("idle");
  const [syncState, setSyncState] = useState<"idle" | "working" | "done">("idle");
  const poolIndex = useRef(0);
  const idCounter = useRef(100);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const item = FEED_POOL[poolIndex.current % FEED_POOL.length];
      poolIndex.current += 1;
      idCounter.current += 1;
      setFeed((prev) => [{ ...item, id: idCounter.current, time: "now" }, ...prev].slice(0, 9));
    }, 6000);
    return () => clearInterval(interval);
  }, [paused]);

  const runAction = (
    setter: (s: "idle" | "working" | "done") => void,
  ) => {
    setter("working");
    setTimeout(() => {
      setter("done");
      setTimeout(() => setter("idle"), 2500);
    }, 1600);
  };

  const filteredAlerts = alerts.filter((a) => severityFilter === "all" || a.severity === severityFilter);
  const activeCount = AGENTS.filter((a) => a.status === "active").length;
  const selected = AGENTS.find((a) => a.name === selectedAgent);
  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <LayoutDashboard className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Sales Manager</h1>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Command center — {activeCount}/16 agents active · swarm operational
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPaused((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
              paused ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/25 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20"
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? "Resume All Campaigns" : "Pause All Campaigns"}
          </button>
          <button
            onClick={() => runAction(setExportState)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
          >
            {exportState === "working" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : exportState === "done" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
            {exportState === "working" ? "Exporting…" : exportState === "done" ? "Report exported" : "Export Report"}
          </button>
          <button
            onClick={() => runAction(setSyncState)}
            className="flex items-center gap-2 rounded-lg bg-gold-gradient px-3.5 py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02]"
          >
            {syncState === "working" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : syncState === "done" ? <Check className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {syncState === "working" ? "Syncing…" : syncState === "done" ? "CRM synced" : "Sync CRM"}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/10">
                  <Icon className={`h-4 w-4 ${k.accent}`} />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  {k.delta}
                </span>
              </div>
              <p className="mt-3.5 text-2xl font-extrabold text-white">{k.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Feed + alerts */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Activity feed */}
        <div className={`rounded-xl border border-white/10 bg-[#1A1A1A] p-5 transition-opacity ${paused ? "opacity-50" : ""}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="h-4 w-4 text-gold" />
              Real-Time Activity Feed
            </h2>
            <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
              <Radio className="h-3 w-3" />
              {paused ? "PAUSED" : "LIVE"}
            </span>
          </div>

          <div className="relative">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-gold/40 via-white/10 to-transparent" />
            <div className="max-h-[340px] space-y-3 overflow-hidden">
              {feed.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 pl-0 ${i === 0 ? "animate-fade-in-up" : ""}`}
                >
                  <span className={`relative z-10 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${i === 0 ? "bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "bg-gray-600"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-gray-300">
                      <span className="font-semibold text-gold">{item.agent}</span> {item.text}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-500">
                      <span className={item.time === "now" ? "font-bold text-emerald-400" : ""}>{item.time === "now" ? "just now" : item.time}</span>
                      <span className="uppercase tracking-wider text-gray-600">·</span>
                      <span className="text-gray-600">{item.platform === "crm" ? "CRM" : item.platform === "internal" ? "internal" : item.platform === "x" ? "X" : "LinkedIn"}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Bell className="h-4 w-4 text-gold" />
              Needs Attention
              {alerts.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[9px] font-bold text-black">{alerts.length}</span>
              )}
            </h2>
          </div>

          <div className="mb-3 flex gap-1.5">
            {(["all", "critical", "warning", "info"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={`rounded-md border px-2 py-1 text-[10px] font-bold capitalize transition-all ${
                  severityFilter === f ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 text-gray-500 hover:text-white"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          <div className="max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
            {filteredAlerts.length === 0 && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
                <Check className="mx-auto h-6 w-6 text-emerald-400" />
                <p className="mt-2 text-xs font-semibold text-emerald-300">All clear — no open alerts</p>
              </div>
            )}
            {filteredAlerts.map((a) => {
              const meta = SEVERITY_META[a.severity];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="group rounded-xl border border-white/10 bg-[#141414] p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border ${meta.badge}`}>
                        <Icon className="h-3 w-3" />
                      </span>
                      <p className="text-xs font-semibold text-white">{a.title}</p>
                    </div>
                    <button
                      onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                      className="text-gray-600 opacity-0 transition-all hover:text-white group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 pl-8.5 text-[11px] leading-relaxed text-gray-400">{a.detail}</p>
                  <div className="mt-2 pl-8.5 flex items-center gap-2">
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badge}`}>{meta.label}</span>
                    <span className="text-[10px] text-gray-600">{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent health grid */}
      <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Users className="h-4 w-4 text-gold" />
            Agent Health — 16 Agents
          </h2>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active ({AGENTS.filter((a) => a.status === "active").length})</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Idle ({AGENTS.filter((a) => a.status === "idle").length})</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Error ({AGENTS.filter((a) => a.status === "error").length})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a) => {
            const meta = STATUS_META[a.status];
            const active = selectedAgent === a.name;
            return (
              <button
                key={a.name}
                onClick={() => setSelectedAgent(a.name)}
                className={`rounded-xl border p-3 text-left transition-all duration-200 ${meta.border} ${
                  a.status === "error" ? "bg-rose-400/[0.04]" : "bg-[#141414]"
                } ${active ? "ring-1 ring-gold/40 shadow-[0_0_16px_rgba(212,175,55,0.08)]" : "hover:border-white/25"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-white">{a.name}</p>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    {a.status === "active" && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>{meta.label}</span>
                  <span className="text-[10px] text-gray-500">{a.tasks} tasks</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${a.status === "error" ? "bg-rose-400/70" : a.status === "idle" ? "bg-amber-400/60" : "bg-gold-gradient"}`}
                    style={{ width: `${a.success}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] text-gray-600">{a.success}% success</p>
              </button>
            );
          })}
        </div>

        {/* Selected agent detail */}
        {selected && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-gold/20 bg-gold/[0.04] p-4">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[selected.status].dot}`} />
            <p className="text-sm font-bold text-white">{selected.name}</p>
            <span className="text-xs text-gray-400">{selected.note}</span>
            <div className="ml-auto flex items-center gap-4 text-[11px]">
              <span className="text-gray-500">Tasks today: <span className="font-bold text-white">{selected.tasks}</span></span>
              <span className="text-gray-500">Success: <span className="font-bold text-gold">{selected.success}%</span></span>
              {selected.status === "error" && (
                <span className="flex items-center gap-1 rounded-md border border-rose-400/25 bg-rose-400/10 px-2 py-1 text-[10px] font-bold text-rose-300">
                  <Zap className="h-3 w-3" /> Retry queued
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
