"use client";

import { useState } from "react";
import {
  TrendingUp, DollarSign, Percent, Timer, Wallet, ArrowUpRight,
  ArrowDownRight, Calculator, Zap, Target, ChevronRight, Trophy,
  Activity, Layers,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LabelList, AreaChart, Area,
} from "recharts";

interface Stage {
  stage: string;
  count: number;
  value: number; // $ open value sitting in this stage
  color: string;
}

const FUNNEL: Stage[] = [
  { stage: "Lead", count: 1240, value: 0, color: "#F4D03F" },
  { stage: "Contacted", count: 860, value: 0, color: "#D4AF37" },
  { stage: "Qualified", count: 386, value: 1096000, color: "#B8860B" },
  { stage: "Proposal", count: 128, value: 3635000, color: "#8A6A14" },
  { stage: "Closed Won", count: 44, value: 1249600, color: "#6B4F0A" },
];

const TRANSITIONS = [
  { from: "Lead", to: "Contacted", rate: 69.4, note: "strong signal quality" },
  { from: "Contacted", to: "Qualified", rate: 44.9, note: "reply rate is the lever" },
  { from: "Qualified", to: "Proposal", rate: 33.2, note: "meeting-to-proposal solid" },
  { from: "Proposal", to: "Closed Won", rate: 34.4, note: "+4.1% vs last quarter" },
];

const REVENUE_TREND = [
  { week: "Wk 1", won: 42 },
  { week: "Wk 2", won: 58 },
  { week: "Wk 3", won: 51 },
  { week: "Wk 4", won: 76 },
  { week: "Wk 5", won: 88 },
  { week: "Wk 6", won: 82 },
  { week: "Wk 7", won: 104 },
  { week: "Wk 8", won: 118 },
];

const METRICS = [
  { icon: Wallet, label: "Total Pipeline Value", value: "$3.42M", delta: "+18.2%", up: true, sub: "open qualified + proposal stages" },
  { icon: DollarSign, label: "Average Deal Size", value: "$28.4K", delta: "+6.1%", up: true, sub: "trailing 90 days" },
  { icon: Percent, label: "Win Rate", value: "34.4%", delta: "+4.1%", up: true, sub: "proposal → closed won" },
  { icon: Timer, label: "Avg Sales Cycle", value: "23 days", delta: "-3 days", up: false, sub: "contacted → closed" },
];

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function PipelineAnalystPage() {
  const [adSpend, setAdSpend] = useState("5000");
  const [costPerLead, setCostPerLead] = useState("45");
  const [closeRate, setCloseRate] = useState("12");
  const [dealSize, setDealSize] = useState("28400");

  const spend = Math.max(0, parseFloat(adSpend) || 0);
  const cpl = Math.max(0.01, parseFloat(costPerLead) || 0);
  const rate = Math.min(100, Math.max(0, parseFloat(closeRate) || 0));
  const size = Math.max(0, parseFloat(dealSize) || 0);

  const leads = Math.floor(spend / cpl);
  const deals = leads * (rate / 100);
  const revenue = deals * size;
  const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
  const multiple = spend > 0 ? revenue / spend : 0;

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Pipeline Analyst</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Stage-by-stage conversion, velocity, and forecast health — refreshed every 15 minutes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 px-4 py-2.5">
          <Zap className="h-4 w-4 text-gold" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Q4 Forecast</p>
            <p className="text-xs font-bold text-white">$1.28M <span className="font-medium text-emerald-400">92% confidence</span></p>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/10">
                  <Icon className="h-4 w-4 text-gold" />
                </div>
                <span className={`flex items-center gap-1 text-[11px] font-bold ${m.up ? "text-emerald-400" : "text-sky-300"}`}>
                  {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.delta}
                </span>
              </div>
              <p className="mt-3.5 text-2xl font-extrabold text-white">{m.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">{m.label}</p>
              <p className="mt-1 text-[10px] text-gray-600">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Funnel + conversion ladder */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Funnel chart */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Pipeline Funnel</h2>
              <p className="text-[11px] text-gray-500">Last 90 days — all sources, X + LinkedIn combined</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-gray-400">
              <Layers className="h-3 w-3 text-gold" /> 2,658 records
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL} layout="vertical" margin={{ left: 4, right: 44, top: 4, bottom: 4 }}>
                <XAxis type="number" hide domain={[0, "dataMax"]} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  width={92}
                  tick={{ fill: "#D1D5DB", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(212,175,55,0.04)" }}
                  contentStyle={{
                    background: "#111",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#D4AF37", fontWeight: 700 }}
                  formatter={(value, name) =>
                    name === "count" ? [Number(value ?? 0).toLocaleString(), "Records"] : [fmtMoney(Number(value ?? 0)), "Open value"]
                  }
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={34}>
                  {FUNNEL.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                  <LabelList dataKey="count" position="right" fill="#F9FAFB" fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage value strip */}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 sm:grid-cols-5">
            {FUNNEL.map((s) => (
              <div key={s.stage} className="rounded-lg border border-white/5 bg-[#141414] px-2.5 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{s.stage}</p>
                <p className="text-xs font-bold text-white">{s.value > 0 ? fmtMoney(s.value) : "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion ladder */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <h2 className="text-sm font-bold text-white">Stage Conversion</h2>
          <p className="mb-4 text-[11px] text-gray-500">Between-stage pass-through rates</p>

          <div className="space-y-3">
            {TRANSITIONS.map((t) => {
              const good = t.rate >= 40;
              return (
                <div key={t.from} className="rounded-xl border border-white/5 bg-[#141414] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-gray-300">{t.from}</span>
                      <ChevronRight className="h-3 w-3 text-gray-600" />
                      <span className="rounded-md bg-gold/10 px-1.5 py-0.5 text-gold">{t.to}</span>
                    </div>
                    <span className={`text-sm font-extrabold ${good ? "text-emerald-400" : "text-amber-300"}`}>
                      {t.rate}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${good ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${t.rate}%` }} />
                  </div>
                  <p className="mt-1.5 text-[10px] text-gray-500">{t.note}</p>
                </div>
              );
            })}
          </div>

          {/* Overall */}
          <div className="mt-4 rounded-xl border border-gold/25 bg-gold/[0.06] p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-gold">
                <Target className="h-3.5 w-3.5" /> Lead → Closed Won
              </p>
              <p className="text-lg font-extrabold text-gold-gradient">3.5%</p>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
              Industry median for AI-assisted outbound is 1.9% — you&apos;re running <span className="font-semibold text-emerald-400">1.8x above benchmark</span>.
            </p>
          </div>
        </div>
      </div>

      {/* ROI calculator + trend */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ROI calculator */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/20 bg-gold/10">
              <Calculator className="h-4 w-4 text-gold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Campaign ROI Calculator</h2>
              <p className="text-[11px] text-gray-500">Model return on paid + agent-generated pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Monthly ad spend", value: adSpend, set: setAdSpend, prefix: "$" },
              { label: "Cost per lead", value: costPerLead, set: setCostPerLead, prefix: "$" },
              { label: "Close rate (%)", value: closeRate, set: setCloseRate, prefix: "%" },
              { label: "Avg deal size", value: dealSize, set: setDealSize, prefix: "$" },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500">{f.prefix}</span>
                  <input
                    type="number"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#141414] py-2 pl-7 pr-3 text-sm font-semibold text-white outline-none transition-colors focus:border-gold/40"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#141414] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Est. Leads / mo</p>
              <p className="mt-1 text-xl font-extrabold text-white">{leads.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#141414] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Est. Deals / mo</p>
              <p className="mt-1 text-xl font-extrabold text-white">{deals.toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#141414] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Est. Revenue</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-400">{fmtMoney(revenue)}</p>
            </div>
            <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-3.5 glow-gold">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold">ROI</p>
              <p className="mt-1 text-xl font-extrabold text-gold-gradient">
                {roi > 0 ? "+" : ""}{roi >= 1000 ? `${(roi / 1000).toFixed(1)}K` : roi.toFixed(0)}%
                <span className="ml-1.5 text-xs font-bold text-gold/70">({multiple.toFixed(1)}x)</span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-gray-600">
            Assumptions default to your trailing 90-day blended averages. Agent-sourced leads convert 2.6x higher than paid — actual ROI runs richer.
          </p>
        </div>

        {/* Revenue trend */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Closed-Won Velocity</h2>
              <p className="text-[11px] text-gray-500">Weekly won revenue — trailing 8 weeks</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300">
              <Trophy className="h-3 w-3" /> +181% WoW
            </span>
          </div>

          <div className="h-[252px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickFormatter={(v: number) => `$${v}K`}
                  width={44}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(212,175,55,0.3)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "#111",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#D4AF37", fontWeight: 700 }}
                  formatter={(value) => [`$${Number(value ?? 0)}K`, "Closed-won"]}
                />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fill="url(#goldFill)"
                  dot={{ r: 3, fill: "#D4AF37", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#F4D03F", stroke: "#0A0A0A", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">8-wk total</p>
              <p className="text-sm font-bold text-white">$619K</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Best week</p>
              <p className="text-sm font-bold text-gold">$118K · Wk 8</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Trend</p>
              <p className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                <Activity className="h-3 w-3" /> Accelerating
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
