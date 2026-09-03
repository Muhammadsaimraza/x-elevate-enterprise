"use client";

import { useState } from "react";
import {
  CalendarCheck, Calendar, Clock, Check, X, DollarSign, UserCheck,
  Target, Zap, Plus, Building2, Users, Sparkles, CheckCircle2, Minus,
} from "lucide-react";

type BantStatus = "confirmed" | "pending" | "missing";

interface Prospect {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  readiness: number; // 1-10
  status: "Qualified" | "In Review" | "Not Qualified" | "Booked";
  bant: { Budget: BantStatus; Authority: BantStatus; Need: BantStatus; Timeline: BantStatus };
  note: string;
}

const PROSPECTS: Prospect[] = [
  {
    id: "p1",
    name: "David Chen",
    initials: "DC",
    role: "Founder & CEO",
    company: "Loopstack",
    readiness: 9,
    status: "Qualified",
    bant: { Budget: "confirmed", Authority: "confirmed", Need: "confirmed", Timeline: "confirmed" },
    note: "Asked for pricing + security docs. Prefers Tue/Thu afternoons.",
  },
  {
    id: "p2",
    name: "Ryan Park",
    initials: "RP",
    role: "Founder",
    company: "Modulr",
    readiness: 8,
    status: "Qualified",
    bant: { Budget: "confirmed", Authority: "confirmed", Need: "confirmed", Timeline: "pending" },
    note: "Replied 'interesting timing' — wants a breakfast-style demo.",
  },
  {
    id: "p3",
    name: "Alex Rivera",
    initials: "AR",
    role: "VP Sales",
    company: "Nova Freight",
    readiness: 7,
    status: "In Review",
    bant: { Budget: "pending", Authority: "confirmed", Need: "confirmed", Timeline: "confirmed" },
    note: "Budget cycles in Oct. Champion is engaged — 4 replies this week.",
  },
  {
    id: "p4",
    name: "Jordan Blake",
    initials: "JB",
    role: "Growth Lead",
    company: "Helio Systems",
    readiness: 5,
    status: "In Review",
    bant: { Budget: "pending", Authority: "missing", Need: "confirmed", Timeline: "pending" },
    note: "Needs exec sponsor before budget talk. Nurturing with content.",
  },
  {
    id: "p5",
    name: "Marcus Webb",
    initials: "MW",
    role: "Head of Growth",
    company: "Nimbus Labs",
    readiness: 3,
    status: "Not Qualified",
    bant: { Budget: "missing", Authority: "confirmed", Need: "missing", Timeline: "missing" },
    note: "Competitor locked until 2027. Suppressed — revisit Q1.",
  },
];

const DAYS = [
  { label: "Mon", date: "Sep 7" },
  { label: "Tue", date: "Sep 8" },
  { label: "Wed", date: "Sep 9" },
  { label: "Thu", date: "Sep 10" },
  { label: "Fri", date: "Sep 11" },
];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

const INITIAL_AVAILABLE = new Set(["0-9", "0-13", "1-10", "1-15", "2-9", "2-15", "3-11", "3-16", "4-10", "4-14"]);

interface Booking {
  prospectId: string | null;
  type: string;
}

const INITIAL_BOOKINGS: Record<string, Booking> = {
  "0-10": { prospectId: "p1", type: "Discovery" },
  "1-14": { prospectId: null, type: "Team Sync" },
  "2-11": { prospectId: "p3", type: "Discovery" },
};

const BANT_ICONS = { Budget: DollarSign, Authority: UserCheck, Need: Target, Timeline: Clock } as const;

const BANT_STATUS_META: Record<BantStatus, { label: string; icon: typeof Check; cls: string }> = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
  pending: { label: "In Review", icon: Minus, cls: "text-amber-300 bg-amber-400/10 border-amber-400/25" },
  missing: { label: "Missing", icon: X, cls: "text-rose-400 bg-rose-400/10 border-rose-400/25" },
};

export default function MeetingQualifierPage() {
  const [selectedId, setSelectedId] = useState("p1");
  const [available, setAvailable] = useState<Set<string>>(new Set(INITIAL_AVAILABLE));
  const [bookings, setBookings] = useState<Record<string, Booking>>(INITIAL_BOOKINGS);
  const [toast, setToast] = useState<string | null>(null);

  const selected = PROSPECTS.find((p) => p.id === selectedId) ?? PROSPECTS[0];

  const bookMeeting = (prospect: Prospect, dayIdx: number, hour: number) => {
    const key = `${dayIdx}-${hour}`;
    if (!available.has(key)) return;
    setAvailable((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setBookings((prev) => ({ ...prev, [key]: { prospectId: prospect.id, type: "Discovery" } }));
    setToast(`Meeting booked — ${prospect.name} (${prospect.company}), ${DAYS[dayIdx].label} ${hour}:00. Agenda + qualification brief sent.`);
    setTimeout(() => setToast(null), 4000);
  };

  const bookBestSlot = (prospect: Prospect) => {
    for (let d = 0; d < DAYS.length; d++) {
      for (const h of HOURS) {
        if (available.has(`${d}-${h}`)) {
          bookMeeting(prospect, d, h);
          return;
        }
      }
    }
    setToast("No open slots this week — calendar is full.");
    setTimeout(() => setToast(null), 3000);
  };

  const bantScore = (p: Prospect) =>
    Object.values(p.bant).filter((s) => s === "confirmed").length;

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <CalendarCheck className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Meeting Qualifier</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              BANT/MEDDIC pre-qualification — {PROSPECTS.filter((p) => p.status === "Qualified").length} qualified prospects awaiting scheduling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2 text-gray-400">
            <Calendar className="h-3.5 w-3.5 text-gold" /> Week of Sep 7–11
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2 text-gray-400">
            <Users className="h-3.5 w-3.5 text-emerald-400" /> 71% show-rate
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        {/* Calendar */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Calendar className="h-4 w-4 text-gold" /> Availability — Working Hours
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm border border-emerald-400/50 bg-emerald-400/10" /> Open slot</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm border border-gold/50 bg-gold/30" /> Booked</span>
              <span className="hidden items-center gap-1.5 sm:flex"><span className="h-2 w-2 rounded-sm border border-white/10 bg-[#111]" /> Unavailable</span>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-[52px_repeat(5,minmax(0,1fr))] gap-1.5">
            <div />
            {DAYS.map((d) => (
              <div key={d.label} className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-2 text-center">
                <p className="text-xs font-bold text-white">{d.label}</p>
                <p className="text-[10px] text-gray-500">{d.date}</p>
              </div>
            ))}

            {/* Time rows */}
            {HOURS.map((h) => (
              <div key={h} className="contents">
                <div className="flex items-start justify-end pr-1 pt-2.5">
                  <span className="text-[10px] font-semibold text-gray-600">{h}:00</span>
                </div>
                {DAYS.map((d, di) => {
                  const key = `${di}-${h}`;
                  const booking = bookings[key];
                  const isOpen = available.has(key);
                  const isLunch = h === 12;

                  if (booking) {
                    const p = PROSPECTS.find((x) => x.id === booking.prospectId);
                    return (
                      <div key={key} className="flex h-[52px] flex-col justify-center overflow-hidden rounded-lg border border-gold/40 bg-gold/15 px-2 shadow-[0_0_12px_rgba(212,175,55,0.08)]">
                        <p className="truncate text-[10px] font-bold text-gold">{booking.type}</p>
                        <p className="truncate text-[10px] font-medium text-white">
                          {p ? `${p.name}` : booking.type === "Team Sync" ? "Team Sync" : "Booked"}
                        </p>
                        {p && <p className="truncate text-[9px] text-gray-400">{p.company}</p>}
                      </div>
                    );
                  }

                  if (isOpen) {
                    return (
                      <button
                        key={key}
                        onClick={() => bookMeeting(selected, di, h)}
                        className="group flex h-[52px] items-center justify-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-400/[0.04] transition-all hover:border-emerald-400/70 hover:bg-emerald-400/10"
                        title={`Book ${selected.name} — ${d.label} ${h}:00`}
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-400/70 transition-colors group-hover:text-emerald-300" />
                        <span className="text-[9px] font-semibold text-emerald-400/70 transition-colors group-hover:text-emerald-300">Open</span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className={`h-[52px] rounded-lg border border-white/5 ${isLunch ? "bg-white/[0.02]" : "bg-[#141414]"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-500">
            <Zap className="h-3 w-3 text-gold" />
            Click any open slot to book <span className="font-semibold text-white">{selected.name}</span> — agendas auto-generate from BANT gaps.
          </p>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Prospect queue */}
          <div>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Qualified Prospect Queue</p>
            <div className="space-y-2.5">
              {PROSPECTS.map((p) => {
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
                      active ? "border-gold/40 bg-gold/[0.05] shadow-[0_0_18px_rgba(212,175,55,0.07)]" : "border-white/10 bg-[#1A1A1A] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600/40 to-gray-800/40">
                        <span className="text-[10px] font-bold text-white">{p.initials}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-sm font-semibold ${active ? "text-gold" : "text-white"}`}>{p.name}</p>
                          <span className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            p.status === "Qualified" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                            : p.status === "In Review" ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                            : p.status === "Booked" ? "border-gold/30 bg-gold/10 text-gold"
                            : "border-rose-400/25 bg-rose-400/10 text-rose-300"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-gray-500">{p.role} · {p.company}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Readiness</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-2.5 w-1 rounded-sm transition-colors ${i < p.readiness ? "bg-gold-gradient" : "bg-white/10"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-gold">{p.readiness}/10</span>
                        </div>
                      </div>
                    </div>
                    {active && (
                      <div className="mt-3 space-y-2 border-t border-white/5 pt-2.5">
                        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-400">
                          <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold" />
                          {p.note}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); bookBestSlot(p); }}
                          disabled={p.status === "Not Qualified" || Object.values(bookings).some((b) => b.prospectId === p.id)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gold-gradient px-3 py-2 text-[11px] font-bold text-black transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {Object.values(bookings).some((b) => b.prospectId === p.id) ? (
                            <><Check className="h-3.5 w-3.5" /> Meeting Booked</>
                          ) : (
                            <><Calendar className="h-3.5 w-3.5" /> Book Meeting</>
                          )}
                        </button>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BANT checklist */}
          <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">BANT Qualification</p>
              <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">{bantScore(selected)}/4 criteria</span>
            </div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
              <Building2 className="h-3.5 w-3.5 text-gold" />
              {selected.name} — {selected.company}
            </p>
            <div className="space-y-2">
              {(Object.keys(BANT_ICONS) as (keyof typeof BANT_ICONS)[]).map((k) => {
                const Icon = BANT_ICONS[k];
                const st = selected.bant[k];
                const meta = BANT_STATUS_META[st];
                return (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-white/5 bg-[#141414] px-3 py-2">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Icon className="h-3.5 w-3.5 text-gray-400" />
                      {k}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.cls}`}>
                      <meta.icon className="h-2.5 w-2.5" />
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={`mt-3 rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed ${
              bantScore(selected) >= 3
                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200/80"
                : "border-amber-400/20 bg-amber-400/5 text-amber-200/80"
            }`}>
              {bantScore(selected) >= 3
                ? "Strong qualification — discovery agenda will focus on scoping and close plan."
                : `Gap detected — agenda will probe ${Object.entries(selected.bant).filter(([, s]) => s !== "confirmed").map(([k]) => k).join(" & ")} before advancing.`}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex animate-fade-in-up items-center gap-2.5 rounded-xl border border-gold/30 bg-[#1A1A1A] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] glow-gold">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-gold" />
          <p className="max-w-xs text-xs font-medium text-white">{toast}</p>
        </div>
      )}
    </div>
  );
}
