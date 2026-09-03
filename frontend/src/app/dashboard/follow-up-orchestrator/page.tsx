"use client";

import { useState } from "react";
import {
  CalendarClock, GripVertical, Send, Reply, Clock, Zap,
  Users, Activity, ChevronDown, Check, AtSign, Globe,
  SlidersHorizontal, Plus, TrendingUp, Pause,
} from "lucide-react";

type Status = "Scheduled" | "Sent" | "Replied";
type Channel = "x" | "linkedin";

interface Lead {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  lastAction: string;
  status: Status;
  channel: Channel;
  engagement: number;
  nextAction: string;
}

interface Column {
  id: string;
  label: string;
  touch: string;
  leads: Lead[];
}

const TEMPLATES: Record<string, { label: string; touches: string[]; note: string }> = {
  standard: {
    label: "Standard 5-Touch",
    touches: ["Initial DM", "Value Add", "Case Study", "Soft Breakup", "Re-engage"],
    note: "Balanced cadence — best all-around reply rates (11.4%)",
  },
  aggressive: {
    label: "Aggressive 7-Touch",
    touches: ["DM + Email", "Voice Note", "Thread Bump", "Social Proof", "Exec CC", "Direct Ask", "Breakup"],
    note: "High-intent segments only — max volume, strict opt-out rules",
  },
  nurture: {
    label: "Gentle Nurture",
    touches: ["Intro DM", "Resource Share", "Comment + Ping", "Quarterly Check", "Newsletter Loop"],
    note: "Long-cycle prospects — zero pressure, content-led",
  },
  postdemo: {
    label: "Post-Demo Accelerator",
    touches: ["Same-day Recap", "Pricing + ROI", "Champion Brief", "Security Docs", "Close Plan"],
    note: "Runs after a completed demo — 31% meeting-to-deal rate",
  },
};

const BASE_LEADS: Omit<Lead, "id">[] = [
  { name: "Alex Rivera", initials: "AR", role: "VP Sales", company: "Nova Freight", lastAction: "Initial DM sent 09:12", status: "Scheduled", channel: "x", engagement: 82, nextAction: "Queue Day-3 value add: 'Signal-based prospecting teardown'" },
  { name: "Jordan Blake", initials: "JB", role: "Growth Lead", company: "Helio Systems", lastAction: "Connection request accepted", status: "Sent", channel: "linkedin", engagement: 61, nextAction: "Day-3 touch fires tomorrow 08:00 — top-of-feed DM" },
  { name: "Mia Torres", initials: "MT", role: "Head of RevOps", company: "Driftwood Analytics", lastAction: "Replied: 'send the case study'", status: "Replied", channel: "linkedin", engagement: 94, nextAction: "HOT — bypass cadence, route to Meeting Qualifier now" },
  { name: "Sam Osei", initials: "SO", role: "Director of Sales", company: "Cobalt Health", lastAction: "Case study DM queued", status: "Scheduled", channel: "x", engagement: 44, nextAction: "A/B test: opens with ROI stat vs. peer name-drop" },
  { name: "Lena Fischer", initials: "LF", role: "CRO", company: "Brightstack", lastAction: "Follow-up DM sent 2h ago", status: "Sent", channel: "x", engagement: 57, nextAction: "Monitoring — opens but no clicks yet; pause 5 days" },
  { name: "Ryan Park", initials: "RP", role: "Founder", company: "Modulr", lastAction: "Replied: 'interesting timing'", status: "Replied", channel: "linkedin", engagement: 89, nextAction: "Booked breakfast demo Thursday — sequence paused" },
  { name: "Isabel Moreau", initials: "IM", role: "VP Marketing", company: "Fjordline", lastAction: "Re-engagement DM delivered", status: "Sent", channel: "linkedin", engagement: 38, nextAction: "Final touch — if silent, archive to Q1 nurture list" },
  { name: "Derek Vaughn", initials: "DV", role: "Sales Ops Manager", company: "Terrace Labs", lastAction: "Breakup message scheduled", status: "Scheduled", channel: "x", engagement: 26, nextAction: "Last shot before 90-day suppression window" },
];

const STATUS_STYLES: Record<Status, string> = {
  Scheduled: "bg-gray-400/10 text-gray-300 border-gray-400/25",
  Sent: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  Replied: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
};

const STATUS_ICONS: Record<Status, typeof Clock> = {
  Scheduled: Clock,
  Sent: Send,
  Replied: Reply,
};

function buildColumns(templateId: string): Column[] {
  const touches = TEMPLATES[templateId].touches;
  const distribution = [
    [0, 1],        // Day 1
    [2, 3],        // Day 3
    [4],           // Day 7
    [5, 7],        // Day 14
    [6],           // Day 30
  ];
  return touches.slice(0, 5).map((touch, i) => ({
    id: `day-${[1, 3, 7, 14, 30][i]}`,
    label: `Day ${[1, 3, 7, 14, 30][i]}`,
    touch,
    leads: distribution[i].map((idx) => ({ ...BASE_LEADS[idx], id: `lead-${idx}` })),
  }));
}

export default function FollowUpOrchestratorPage() {
  const [template, setTemplate] = useState("standard");
  const [autoSend, setAutoSend] = useState(true);
  const [paused, setPaused] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>("lead-2");

  const columns = buildColumns(template);

  const toggleLead = (id: string) => setExpandedLead((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <CalendarClock className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Follow-up Orchestrator</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Multi-touch cadences across X &amp; LinkedIn — auto-adjusted by engagement signals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
              paused
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
            }`}
          >
            {paused ? <Zap className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? "Resume Cadence" : "Pause Cadence"}
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02]">
            <Plus className="h-3.5 w-3.5" /> Add Lead to Sequence
          </button>
        </div>
      </div>

      {/* Cadence configuration panel */}
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-[#1A1A1A] p-4 sm:gap-6">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-gold" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Cadence Rules</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-400">Template</label>
          <div className="relative">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#111] py-1.5 pl-3 pr-9 text-xs font-semibold text-white outline-none transition-colors focus:border-gold/40"
            >
              {Object.entries(TEMPLATES).map(([id, t]) => (
                <option key={id} value={id} className="bg-[#111]">{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <button
          onClick={() => setAutoSend((v) => !v)}
          className="flex items-center gap-2.5"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${autoSend ? "bg-gold/70" : "bg-gray-600"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${autoSend ? "left-3.5" : "left-0.5"}`} />
          </span>
          <span className="text-xs font-medium text-gray-300">
            Auto-send touches <span className={autoSend ? "text-emerald-400" : "text-gray-500"}>{autoSend ? "ON" : "OFF"}</span>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold">X DM</span>
          <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[10px] font-bold text-sky-300">LinkedIn InMail</span>
          <span className="text-[10px] text-gray-500">channel mix</span>
        </div>

        <p className="ml-auto text-[11px] italic text-gray-500">{TEMPLATES[template].note}</p>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Users, label: "Total in Sequence", value: "247", sub: "across 12 active cadences", accent: "text-gold" },
          { icon: Send, label: "Sent Today", value: "38", sub: "18 X DMs · 20 InMails", accent: "text-sky-300" },
          { icon: TrendingUp, label: "Replies Received", value: "9", sub: "+23% vs. last week", accent: "text-emerald-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Icon className={`h-4.5 w-4.5 ${s.accent}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="truncate text-[10px] text-gray-500">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className={`overflow-x-auto pb-4 transition-opacity ${paused ? "opacity-60" : ""}`}>
        <div className="grid min-w-[1000px] grid-cols-5 gap-3">
          {columns.map((col, ci) => (
            <div key={col.id} className="flex min-h-[420px] flex-col rounded-xl border border-white/5 bg-[#111]">
              {/* Column header */}
              <div className={`flex-shrink-0 rounded-t-xl border-b border-white/5 px-3.5 py-3 ${ci === 0 ? "bg-gold/[0.07]" : "bg-white/[0.02]"}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${ci === 0 ? "text-gold" : "text-white"}`}>{col.label}</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-[10px] font-bold text-gray-300">
                    {col.leads.length}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  <Activity className="h-2.5 w-2.5" />
                  {col.touch}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                    style={{ width: `${Math.max(20, 100 - ci * 18)}%` }}
                  />
                </div>
              </div>

              {/* Lead cards */}
              <div className="flex-1 space-y-2.5 p-2.5">
                {col.leads.map((lead) => {
                  const StatusIcon = STATUS_ICONS[lead.status];
                  const expanded = expandedLead === lead.id;
                  return (
                    <div
                      key={lead.id}
                      className={`group cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
                        expanded
                          ? "border-gold/35 bg-gold/[0.04] shadow-[0_0_18px_rgba(212,175,55,0.07)]"
                          : "border-white/10 bg-[#1A1A1A] hover:border-white/25"
                      }`}
                      onClick={() => toggleLead(lead.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600/40 to-gray-800/40">
                          <span className="text-[10px] font-bold text-white">{lead.initials}</span>
                          <span className={`absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-[#1A1A1A] ${lead.channel === "x" ? "bg-gray-700" : "bg-sky-600"}`}>
                            {lead.channel === "x" ? <Globe className="h-1.5 w-1.5 text-white" /> : <AtSign className="h-1.5 w-1.5 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="truncate text-xs font-semibold text-white">{lead.name}</p>
                            <GripVertical className="h-3.5 w-3.5 flex-shrink-0 cursor-grab text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" />
                          </div>
                          <p className="truncate text-[10px] text-gray-500">{lead.role} · {lead.company}</p>
                          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_STYLES[lead.status]}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {lead.status}
                          </span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expanded && (
                        <div className="mt-3 space-y-2.5 border-t border-white/5 pt-2.5">
                          <p className="text-[10px] leading-relaxed text-gray-400">
                            <span className="font-bold uppercase tracking-wider text-gray-500">Last action: </span>
                            {lead.lastAction}
                          </p>
                          <div>
                            <div className="mb-1 flex justify-between text-[9px] text-gray-500">
                              <span className="font-bold uppercase tracking-wider">Engagement</span>
                              <span className="font-semibold text-gold">{lead.engagement}/100</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${lead.engagement}%` }} />
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 rounded-lg border border-gold/15 bg-gold/[0.05] p-2">
                            <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold" />
                            <p className="text-[10px] leading-relaxed text-gray-300">{lead.nextAction}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-[10px] font-semibold text-gray-500 transition-colors hover:border-gold/30 hover:text-gold">
                  <Plus className="h-3 w-3" />
                  Drop lead here
                </button>
              </div>

              {/* Column footer */}
              <div className="flex-shrink-0 border-t border-white/5 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] text-gray-600">
                  <Check className="h-2.5 w-2.5" />
                  Auto-adjust: skips Fri PM, max 2 touches/day
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Scheduled</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Sent</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Replied</span>
        <span className="ml-auto hidden sm:block">Drag cards to re-sequence · double-click to open in CRM</span>
      </div>
    </div>
  );
}
