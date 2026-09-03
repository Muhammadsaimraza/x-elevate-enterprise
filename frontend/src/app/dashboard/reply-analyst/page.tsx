"use client";

import { useState } from "react";
import {
  MessageCircle, Search, ThumbsUp, ThumbsDown, Minus, Send,
  Sparkles, Zap, TrendingUp, Check, AtSign, Globe,
  ArrowUpRight, AlertCircle, Reply,
} from "lucide-react";

type Sentiment = "positive" | "negative" | "neutral";
type Platform = "x" | "linkedin";

interface Message {
  id: string;
  sender: "prospect" | "me";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  handle: string;
  role: string;
  company: string;
  platform: Platform;
  initials: string;
  accent: string;
  lastMessage: string;
  timestamp: string;
  sentiment: Sentiment;
  intent: string;
  priority: "High" | "Medium" | "Low";
  unread: number;
  breakdown: { positive: number; negative: number; neutral: number };
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Sarah Kim",
    handle: "@sarahkim_revops",
    role: "VP Revenue Operations",
    company: "Acme Corp",
    platform: "linkedin",
    initials: "SK",
    accent: "from-amber-500/30 to-yellow-600/20",
    lastMessage: "This looks interesting — can you share pricing?",
    timestamp: "09:42",
    sentiment: "positive",
    intent: "Pricing request",
    priority: "High",
    unread: 2,
    breakdown: { positive: 72, negative: 6, neutral: 22 },
    messages: [
      { id: "m1", sender: "me", text: "Hi Sarah — noticed Acme just rolled out the new RevOps playbooks. Teams your size typically recover 6-8 hrs/week automating signal-based prospecting. Worth a look?", time: "Yesterday" },
      { id: "m2", sender: "prospect", text: "Funny timing — we just got budget approved for exactly this category.", time: "Yesterday" },
      { id: "m3", sender: "me", text: "That's great to hear. Happy to walk you through how the agent swarm personalizes outreach at scale.", time: "08:15" },
      { id: "m4", sender: "prospect", text: "This looks interesting — can you share pricing? Also curious about LinkedIn compliance.", time: "09:42" },
    ],
  },
  {
    id: "c2",
    name: "Marcus Webb",
    handle: "@marcuswebb",
    role: "Head of Growth",
    company: "Nimbus Labs",
    platform: "x",
    initials: "MW",
    accent: "from-sky-500/30 to-blue-600/20",
    lastMessage: "Not interested — we already use a competitor tool",
    timestamp: "08:57",
    sentiment: "negative",
    intent: "Competitor objection",
    priority: "High",
    unread: 1,
    breakdown: { positive: 8, negative: 78, neutral: 14 },
    messages: [
      { id: "m1", sender: "me", text: "Hey Marcus — saw Nimbus Labs' launch thread. Your growth team could 3x reply rates with intent-scored DMs. Open to a 15-min teardown?", time: "2 days ago" },
      { id: "m2", sender: "prospect", text: "Not interested — we already use a competitor tool and switching costs are not worth it.", time: "2 days ago" },
      { id: "m3", sender: "prospect", text: "Please stop DMing me on weekends.", time: "08:57" },
    ],
  },
  {
    id: "c3",
    name: "Elena Rodriguez",
    handle: "@elenarod_sales",
    role: "Sales Director",
    company: "Vertex Systems",
    platform: "linkedin",
    initials: "ER",
    accent: "from-emerald-500/30 to-teal-600/20",
    lastMessage: "Can you send more info? I'll review next quarter",
    timestamp: "Yesterday",
    sentiment: "neutral",
    intent: "Timing deferral",
    priority: "Medium",
    unread: 0,
    breakdown: { positive: 31, negative: 12, neutral: 57 },
    messages: [
      { id: "m1", sender: "me", text: "Hi Elena — Vertex's Q3 pipeline report was sharp. How are you handling follow-up drop-off after first calls?", time: "3 days ago" },
      { id: "m2", sender: "prospect", text: "Good question — it's our biggest leak right now honestly.", time: "3 days ago" },
      { id: "m3", sender: "prospect", text: "Can you send more info? I'll review next quarter when we revisit our stack.", time: "Yesterday" },
    ],
  },
  {
    id: "c4",
    name: "David Chen",
    handle: "@davidchen_io",
    role: "Founder & CEO",
    company: "Loopstack",
    platform: "x",
    initials: "DC",
    accent: "from-violet-500/30 to-purple-600/20",
    lastMessage: "Love this — let's set up a call this week",
    timestamp: "Yesterday",
    sentiment: "positive",
    intent: "Meeting request",
    priority: "High",
    unread: 0,
    breakdown: { positive: 88, negative: 2, neutral: 10 },
    messages: [
      { id: "m1", sender: "me", text: "David — your build-in-public thread on Loopstack's first 100 customers was excellent. Curious how you're sourcing pipeline now.", time: "4 days ago" },
      { id: "m2", sender: "prospect", text: "Manual grind mostly 😅 DMs, intros, cold email. It doesn't scale.", time: "4 days ago" },
      { id: "m3", sender: "me", text: "That's exactly what the swarm automates — 16 agents from signal detection to CRM sync. Zero manual touches.", time: "3 days ago" },
      { id: "m4", sender: "prospect", text: "Love this — let's set up a call this week. Tuesday or Thursday afternoon works.", time: "Yesterday" },
    ],
  },
  {
    id: "c5",
    name: "Priya Sharma",
    handle: "@priya_quantumly",
    role: "Chief Revenue Officer",
    company: "Quantumly",
    platform: "linkedin",
    initials: "PS",
    accent: "from-rose-500/30 to-red-600/20",
    lastMessage: "Please remove me from this sequence",
    timestamp: "Mon",
    sentiment: "negative",
    intent: "Opt-out request",
    priority: "High",
    unread: 1,
    breakdown: { positive: 4, negative: 91, neutral: 5 },
    messages: [
      { id: "m1", sender: "me", text: "Priya — congrats on the Series B. Fast-growing revenue orgs like Quantumly use intent scoring to prioritize...", time: "Mon" },
      { id: "m2", sender: "prospect", text: "Please remove me from this sequence. I've received 5 messages this week.", time: "Mon" },
    ],
  },
  {
    id: "c6",
    name: "Tom Becker",
    handle: "@tbecker_data",
    role: "RevOps Manager",
    company: "Ironclad Data",
    platform: "x",
    initials: "TB",
    accent: "from-cyan-500/30 to-sky-600/20",
    lastMessage: "How does it handle data hygiene across platforms?",
    timestamp: "Mon",
    sentiment: "neutral",
    intent: "Technical question",
    priority: "Medium",
    unread: 0,
    breakdown: { positive: 42, negative: 8, neutral: 50 },
    messages: [
      { id: "m1", sender: "me", text: "Tom — that thread on CRM deduplication pain was spot on. Is Ironclad still manually merging records?", time: "Mon" },
      { id: "m2", sender: "prospect", text: "Guilty. How does it handle data hygiene across platforms?", time: "Mon" },
    ],
  },
];

const SENTIMENT_META: Record<Sentiment, { label: string; dot: string; badge: string; bar: string; text: string }> = {
  positive: { label: "Positive", dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", bar: "bg-emerald-400", text: "text-emerald-400" },
  negative: { label: "Negative", dot: "bg-rose-400", badge: "bg-rose-400/10 text-rose-400 border-rose-400/20", bar: "bg-rose-400", text: "text-rose-400" },
  neutral: { label: "Neutral", dot: "bg-gray-400", badge: "bg-gray-400/10 text-gray-300 border-gray-400/20", bar: "bg-gray-400", text: "text-gray-300" },
};

type ActionKey = "positive" | "followUp" | "escalate";

const ACTIONS: { key: ActionKey; label: string; icon: typeof Zap; classes: string }[] = [
  { key: "positive", label: "Positive Response", icon: ThumbsUp, classes: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20" },
  { key: "followUp", label: "Follow Up", icon: Reply, classes: "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20" },
  { key: "escalate", label: "Escalate", icon: ArrowUpRight, classes: "border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20" },
];

function draftFor(action: ActionKey, c: Conversation): string {
  const first = c.name.split(" ")[0];
  switch (action) {
    case "positive":
      return `Absolutely, ${first} — sending over our pricing tiers now. Quick context that helps: teams like ${c.company} usually start on the Growth plan (agent swarm of 8) and expand once reply rates stabilize. I'll also include the LinkedIn compliance doc you asked about. Would Thursday 2pm work for a 15-min walkthrough?`;
    case "followUp":
      return `Hi ${first} — bumping this up in case it got buried. No pressure on timing; I'll leave the thread open. If ${c.company} revisits the stack next quarter, happy to share the one-pager in the meantime — it's a 3-min read your team can forward internally.`;
    case "escalate":
      return `Flagging for AE handoff: ${first} (${c.role}, ${c.company}) is showing high-intent signals — "${c.intent}" — with ${c.priority.toLowerCase()} priority. Routing to the enterprise queue with full conversation context and enrichment attached. Next step: personal video follow-up within 24h.`;
  }
}

export default function ReplyAnalystPage() {
  const [selectedId, setSelectedId] = useState("c1");
  const [filter, setFilter] = useState<Sentiment | "all">("all");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<ActionKey | null>(null);
  const [sent, setSent] = useState(false);
  const [autoRoute, setAutoRoute] = useState(true);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];

  const filtered = CONVERSATIONS.filter((c) => {
    const sentimentOk = filter === "all" || c.sentiment === filter;
    const q = query.toLowerCase();
    const searchOk = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    return sentimentOk && searchOk;
  });

  const counts = {
    all: CONVERSATIONS.length,
    positive: CONVERSATIONS.filter((c) => c.sentiment === "positive").length,
    negative: CONVERSATIONS.filter((c) => c.sentiment === "negative").length,
    neutral: CONVERSATIONS.filter((c) => c.sentiment === "neutral").length,
  };

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setAction(null);
    setSent(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/5 px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
              <MessageCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Reply Analyst</h1>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Reads, classifies, and routes every inbound reply — 142 analyzed today
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoRoute((v) => !v)}
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
              autoRoute
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-gray-400"
            }`}
          >
            <span className={`relative h-4 w-7 rounded-full transition-colors ${autoRoute ? "bg-emerald-400/60" : "bg-gray-600"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${autoRoute ? "left-3.5" : "left-0.5"}`} />
            </span>
            {autoRoute ? "Auto-routing ON" : "Auto-routing OFF"}
          </button>
        </div>
      </div>

      {/* Toolbar: search + sentiment filters */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 border-b border-white/5 bg-[#0E0E0E] px-4 py-3 sm:px-6 lg:px-10">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, companies, messages…"
            className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none transition-colors focus:border-gold/40"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "positive", "negative", "neutral"] as const).map((f) => {
            const meta = f === "all" ? null : SENTIMENT_META[f];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                  active ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {meta && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
                {f === "all" ? "All" : f} ({counts[f]})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-column workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        {/* Column 1 — conversation list */}
        <div className="flex min-h-0 flex-col border-b border-white/5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Inbox — Replies</p>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pb-3">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-gray-500">No conversations match.</p>
            )}
            {filtered.map((c) => {
              const meta = SENTIMENT_META[c.sentiment];
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                    active ? "border-gold/40 bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.06)]" : "border-transparent hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${c.accent}`}>
                      <span className="text-xs font-bold text-white">{c.initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm font-semibold ${active ? "text-gold" : "text-white"}`}>{c.name}</p>
                        <span className="flex-shrink-0 text-[10px] text-gray-500">{c.timestamp}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-500">{c.role} · {c.company}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badge}`}>
                          <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-black">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 truncate text-xs text-gray-400">{c.lastMessage}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2 — message thread */}
        <div className="flex min-h-0 flex-col bg-[#0A0A0A]">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${selected.accent}`}>
                <span className="text-[11px] font-bold text-white">{selected.initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <p className="text-[11px] text-gray-500">{selected.handle} · {selected.role}, {selected.company}</p>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 rounded-md border border-gold/20 bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold`}>
              {selected.platform === "x" ? <Globe className="h-3 w-3" /> : <AtSign className="h-3 w-3" />}
              {selected.platform === "x" ? "X DM" : "LinkedIn"}
            </span>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {selected.messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] sm:max-w-[70%] ${m.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.sender === "me"
                        ? "rounded-br-md border border-gold/25 bg-gold/10 text-white"
                        : "rounded-bl-md border border-white/10 bg-[#1A1A1A] text-gray-200"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="px-1 text-[10px] text-gray-600">{m.sender === "me" ? "You" : selected.name.split(" ")[0]} · {m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Draft composer */}
          <div className="flex-shrink-0 border-t border-white/5 bg-[#0E0E0E] px-5 py-4">
            {sent ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3.5 text-sm font-medium text-emerald-300">
                <Check className="h-4 w-4" />
                Reply sent — conversation marked as handled
              </div>
            ) : action ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                    <Sparkles className="h-3 w-3" /> AI-generated draft
                  </p>
                  <button onClick={() => setAction(null)} className="text-[11px] text-gray-500 transition-colors hover:text-white">
                    Discard
                  </button>
                </div>
                <textarea
                  key={selected.id + action}
                  defaultValue={draftFor(action, selected)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gold/25 bg-[#1A1A1A] px-3.5 py-3 text-sm leading-relaxed text-gray-200 outline-none transition-colors focus:border-gold/50"
                />
                <div className="mt-2.5 flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">Editable before sending · tone matched to prospect sentiment</p>
                  <button
                    onClick={() => setSent(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-gold-gradient px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-[1.02]"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">Select a suggested action to generate a reply draft</p>
                <button
                  onClick={() => setAction("followUp")}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  <Reply className="h-3.5 w-3.5" /> Quick follow-up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column 3 — analysis panel */}
        <div className="min-h-0 overflow-y-auto border-t border-white/5 bg-[#0E0E0E] p-5 xl:border-l xl:border-t-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Sentiment Analysis</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-400">Overall reading</span>
              <span className={`text-sm font-bold ${SENTIMENT_META[selected.sentiment].text}`}>
                {SENTIMENT_META[selected.sentiment].label}
              </span>
            </div>
            <div className="mt-4 space-y-3.5">
              {([
                { key: "positive", label: "Positive", value: selected.breakdown.positive, icon: ThumbsUp, cls: "bg-emerald-400", txt: "text-emerald-400" },
                { key: "negative", label: "Negative", value: selected.breakdown.negative, icon: ThumbsDown, cls: "bg-rose-400", txt: "text-rose-400" },
                { key: "neutral", label: "Neutral", value: selected.breakdown.neutral, icon: Minus, cls: "bg-gray-400", txt: "text-gray-300" },
              ] as const).map((s) => (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                      <s.icon className={`h-3 w-3 ${s.txt}`} /> {s.label}
                    </span>
                    <span className={`text-[11px] font-bold ${s.txt}`}>{s.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${s.cls} transition-all duration-700`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intent + priority */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Intent</p>
              <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-white">
                <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold" />
                {selected.intent}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Priority</p>
              <p className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                selected.priority === "High" ? "text-rose-300" : selected.priority === "Medium" ? "text-amber-300" : "text-gray-300"
              }`}>
                <TrendingUp className="h-3 w-3" />
                {selected.priority}
              </p>
            </div>
          </div>

          {selected.sentiment === "negative" && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Negative sentiment detected — auto-removed from active sequence and suppressed for 30 days per compliance rules.
              </p>
            </div>
          )}

          {/* Suggested actions */}
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Suggested Actions</p>
          <div className="mt-3 space-y-2">
            {ACTIONS.map((a) => {
              const Icon = a.icon;
              const active = action === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => { setAction(a.key); setSent(false); }}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    active ? `${a.classes} ring-1 ring-gold/30` : `${a.classes} opacity-90`
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {a.label}
                  </span>
                  <span className="text-[10px] opacity-60">{active ? "drafted" : "→"}</span>
                </button>
              );
            })}
          </div>

          {/* Context footer */}
          <div className="mt-5 rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Conversation Health</p>
            <div className="mt-3 space-y-2.5 text-[11px]">
              <div className="flex justify-between"><span className="text-gray-400">Messages exchanged</span><span className="font-semibold text-white">{selected.messages.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">First contact</span><span className="font-semibold text-white">{selected.messages[0]?.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Response rate</span><span className="font-semibold text-emerald-400">{selected.sentiment === "negative" ? "12%" : "68%"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Suggested next touch</span><span className="font-semibold text-gold">in 2 days</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
