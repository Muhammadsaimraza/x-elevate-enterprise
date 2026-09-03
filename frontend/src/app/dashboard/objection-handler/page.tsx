"use client";

import { useState } from "react";
import {
  ShieldCheck, Search, ChevronDown, Sparkles, Loader2, Copy, Check,
  Lightbulb, Zap, DollarSign, Clock, Trophy, UserCheck, Target,
  BookOpen, TrendingUp, RotateCcw, MessageSquare,
} from "lucide-react";

interface Counter {
  framework: string;
  text: string;
}

interface Objection {
  id: string;
  text: string;
  counters: Counter[];
  effectiveness: number;
  tip: string;
  timesUsed: number;
}

interface Category {
  id: string;
  name: string;
  icon: typeof DollarSign;
  blurb: string;
  objections: Objection[];
}

const CATEGORIES: Category[] = [
  {
    id: "price",
    name: "Price",
    icon: DollarSign,
    blurb: "Budget constraints, sticker shock, and cost comparisons",
    objections: [
      {
        id: "p1",
        text: "\u201CYour pricing is too expensive for our budget.\u201D",
        counters: [
          { framework: "ROI Anchor", text: "I hear you — can I share how teams your size frame it? The swarm typically books 18 extra meetings/month. At your average deal size, that pays for the platform 6x over in the first quarter alone." },
          { framework: "Cost of Inaction", text: "Totally fair. Quick math: your reps spend ~9 hrs/week on manual prospecting — that's about $8,400/month in loaded rep cost. The Growth plan is $2,900. You're currently paying a premium to do this by hand." },
          { framework: "Downshift", text: "Understood. If budget is the blocker, most teams start on the Starter tier — 5 agents instead of 16 — and upgrade once reply rates stabilize. Want me to model what that looks like?" },
        ],
        effectiveness: 91,
        tip: "Never discount first. Anchor to rep-hours and cost-per-meeting before touching price.",
        timesUsed: 342,
      },
      {
        id: "p2",
        text: "\u201CWe can get something similar for free with existing tools.\u201D",
        counters: [
          { framework: "Differentiate", text: "Free tools cover single steps — scrape OR enrich OR send. The swarm chains all 16 steps end-to-end with zero manual handoffs. The gap isn't features, it's the 11 hours/week of glue work between them." },
          { framework: "Evidence", text: "That's exactly what Loopstack said in March — they ran the free stack for 6 weeks, got 2 meetings, then 9 in their first 2 weeks here. Happy to intro you to their ops lead." },
        ],
        effectiveness: 76,
        tip: "Ask which free tools they mean — the answer reveals their actual stack and lets you reframe precisely.",
        timesUsed: 118,
      },
      {
        id: "p3",
        text: "\u201CWe don't have budget left this fiscal year.\u201D",
        counters: [
          { framework: "Timing Bridge", text: "Makes sense — most of our Q4 customers started exactly this way. We can run the audit now at no cost, so when budget resets on Jan 1 you're evaluating real numbers instead of promises." },
          { framework: "Pre-pay Angle", text: "If there's leftover budget elsewhere, we offer a 15-month term for a 12-month price when signed before fiscal close. It's the most common way teams solve this." },
        ],
        effectiveness: 83,
        tip: "Book the budget-cycle conversation now — a December 'pencil' meeting converts 3x better than a January cold start.",
        timesUsed: 205,
      },
    ],
  },
  {
    id: "timing",
    name: "Timing",
    icon: Clock,
    blurb: "Deferrals, busy seasons, and 'not right now'",
    objections: [
      {
        id: "t1",
        text: "\u201CNow isn't a good time.\u201D",
        counters: [
          { framework: "Isolate", text: "No problem — and I won't push. Just so I plan around you: is it 'not now' because of a crunch this month, or is this a 2027 conversation?" },
          { framework: "Micro-Commitment", text: "Fair enough. Instead of a call, could I send a 3-minute teardown of how a company in your space fixed this? If it resonates, we talk; if not, I'll close the loop politely." },
        ],
        effectiveness: 88,
        tip: "'Not now' is usually 'not convinced'. Isolate the real timeline before accepting the deferral.",
        timesUsed: 476,
      },
      {
        id: "t2",
        text: "\u201CCall me back next quarter.\u201D",
        counters: [
          { framework: "Confirm Specifics", text: "Happy to. Two quick things so the follow-up actually lands: what changes next quarter — budget, headcount, or priorities? And is early or late quarter better for you?" },
          { framework: "Value Drip", text: "Will do. Between now and then I'll send one short benchmark report on your vertical each month — so when we reconnect you'll already know if this moves your numbers." },
        ],
        effectiveness: 71,
        tip: "Always attach the follow-up to a specific trigger event, not just a date on the calendar.",
        timesUsed: 389,
      },
      {
        id: "t3",
        text: "\u201CWe're too busy with other priorities right now.\u201D",
        counters: [
          { framework: "Priority Flip", text: "That's actually the strongest reason to look — the swarm exists to give your team time back. Would it help if the onboarding was fully done-for-you? Most teams spend under 2 hours total on setup." },
          { framework: "Pain Quantify", text: "Busy usually means manual prospecting is eating your calendar. If I could hand your reps 9 hours a week back starting Monday, does that free up the other priorities?" },
        ],
        effectiveness: 79,
        tip: "Busy-ness is a symptom, not an objection — quantify the time cost of their current process.",
        timesUsed: 251,
      },
    ],
  },
  {
    id: "competition",
    name: "Competition",
    icon: Trophy,
    blurb: "Incumbent tools, failed pilots, and differentiation",
    objections: [
      {
        id: "c1",
        text: "\u201CWe're already working with a competitor.\u201D",
        counters: [
          { framework: "Respect + Wedge", text: "Good — it means you've validated the category. Most of our best customers run us alongside their old tool for one team first, then switch once they compare reply rates side-by-side. Could we do that with one pod?" },
          { framework: "Switch Cost Kill", text: "Makes sense. That's why onboarding includes white-glove data migration from any major platform — your sequences, templates, and CRM mapping carry over. The switch is usually a 48-hour, done-for-you job." },
          { framework: "Disarm", text: "Totally fine, I'm not here to rip anything out. Out of curiosity, if you could change one thing about how it's working today, what would it be?" },
        ],
        effectiveness: 85,
        tip: "Never attack the incumbent — ask what would have to be true for them to consider a change.",
        timesUsed: 297,
      },
      {
        id: "c2",
        text: "\u201CWe tried a similar tool and it didn't work for us.\u201D",
        counters: [
          { framework: "Diagnose", text: "That's genuinely useful to know. When you say it didn't work — was it lead quality, messaging, or the operational lift of running it? The failure mode usually points to which of those three broke, and they all have different fixes." },
          { framework: "Contrast", text: "I appreciate that. What we usually hear from teams who bounced off other tools: they automated messaging but kept manual research. We inverted it — 9 of our 16 agents do nothing but research and enrichment. Want to see the difference on 10 of your actual accounts?" },
        ],
        effectiveness: 81,
        tip: "Past failure is an asset — it means they've already tried to solve the problem and felt the pain firsthand.",
        timesUsed: 164,
      },
    ],
  },
  {
    id: "authority",
    name: "Authority",
    icon: UserCheck,
    blurb: "Committee buying, manager sign-off, and champions",
    objections: [
      {
        id: "a1",
        text: "\u201CI need to check with my manager first.\u201D",
        counters: [
          { framework: "Arm the Champion", text: "Smart — can I make that easy for you? I'll send a one-page brief with the ROI math and a 90-second demo video, formatted for forwarding. That way you're not stuck translating." },
          { framework: "Multi-thread", text: "Of course. Would it help if I joined a 15-minute call with both of you? Committees usually move faster when the numbers come straight from the source instead of secondhand." },
        ],
        effectiveness: 87,
        tip: "Turn your contact into a champion — give them collateral built to be forwarded upward.",
        timesUsed: 418,
      },
      {
        id: "a2",
        text: "\u201CI'm not the decision-maker on tools like this.\u201D",
        counters: [
          { framework: "Map the Room", text: "Thanks for being straight with me — who else typically weighs in? In RevOps purchases I usually see Finance care about payback, Security about compliance, and the VP about rep adoption. Which of those is the real gate here?" },
          { framework: "Bottom-up Value", text: "That's fine — you don't need to be. If I can save your team 9 hours a week, is that something you'd personally want in place regardless of who signs for it?" },
        ],
        effectiveness: 74,
        tip: "Ask who the economic buyer is directly — 60% of 'not the decision-maker' contacts will tell you exactly who is.",
        timesUsed: 356,
      },
    ],
  },
  {
    id: "need",
    name: "Need",
    icon: Target,
    blurb: "Status quo bias, in-house workarounds, and satisfaction",
    objections: [
      {
        id: "n1",
        text: "\u201CWe're handling this in-house right now.\u201D",
        counters: [
          { framework: "Mirror the Build", text: "Respect — building in-house means it matters to you. Quick question: who maintains it? Most homegrown stacks quietly eat 15-20% of one engineer's time. Would you rather that engineer ship product or babysit scrapers?" },
          { framework: "Benchmark", text: "In-house is a solid baseline. Here's the delta we typically see: manual in-house research caps out around 40 qualified leads/month per rep. Our customers average 140 — with higher data accuracy. Worth a 2-week A/B test on one pod?" },
        ],
        effectiveness: 82,
        tip: "In-house solutions have hidden maintenance costs — name the owner of those costs directly.",
        timesUsed: 233,
      },
      {
        id: "n2",
        text: "\u201COur current process works fine.\u201D",
        counters: [
          { framework: "Agree, Then Raise", text: "If it works, keep it running — seriously. One thing worth knowing: 'fine' at your growth stage usually means reps are the bottleneck. When you're ready to grow pipeline without growing headcount, that's exactly the gap we fill." },
          { framework: "Pain Probe", text: "Glad to hear it. Out of curiosity — if you could change one thing about the current process, anything at all, what would it be? ... That's usually where this conversation gets interesting." },
        ],
        effectiveness: 68,
        tip: "'Fine' is the most dangerous word in sales — leave the door open and nurture on autopilot.",
        timesUsed: 302,
      },
      {
        id: "n3",
        text: "\u201CWe don't really need automation for this.\u201D",
        counters: [
          { framework: "Educate", text: "You might be right — not every team does. The fastest way to know: our free audit runs your last 90 days of outbound through our benchmarks and tells you exactly how much pipeline is leaking. If the answer is 'not much', I'll say so." },
          { framework: "Future-Pace", text: "Fair. The teams that benefit most didn't 'need' it either — until a competitor's reps started showing up in their prospects' inboxes first. Speed-to-lead is the whole game now." },
        ],
        effectiveness: 64,
        tip: "Don't argue need — offer a no-cost measurement that lets the data make your case.",
        timesUsed: 189,
      },
    ],
  },
];

const CATEGORY_COLORS = ["text-amber-300", "text-sky-300", "text-violet-300", "text-emerald-300", "text-rose-300"];

export default function ObjectionHandlerPage() {
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ price: true });
  const [openObjections, setOpenObjections] = useState<Record<string, boolean>>({ p1: true });
  const [customObjection, setCustomObjection] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const q = query.trim().toLowerCase();

  const matches = (o: Objection) =>
    !q || o.text.toLowerCase().includes(q) || o.counters.some((c) => c.text.toLowerCase().includes(q));

  const visibleCategories = CATEGORIES.map((c) => ({
    ...c,
    objections: c.objections.filter(matches),
  })).filter((c) => c.objections.length > 0);

  const toggleCategory = (id: string) =>
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleObjection = (id: string) =>
    setOpenObjections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleGenerate = () => {
    if (!customObjection.trim() || generating) return;
    setGenerating(true);
    setGenerated(null);
    setCopied(false);
    setTimeout(() => {
      setGenerated(
        `Great — here's a counter-response for "${customObjection.trim().slice(0, 120)}${customObjection.trim().length > 120 ? "…" : ""}" built on the LAER framework:\n\n` +
        `1. LISTEN — "I appreciate you being upfront about that — it's a fair concern, and I'd rather dig into it than talk past it."\n\n` +
        `2. ACKNOWLEDGE — "Most of our best customers said the same thing early on, so you're in good company. If it's a hard constraint, I'll respect that."\n\n` +
        `3. EXPLORE — "Can I ask one thing? When you say that, is it driven by budget cycles, a past experience, or a competing priority? The answer changes what makes sense for you."\n\n` +
        `4. RESPOND — "Here's what I'd suggest: let me run a free 90-day teardown on your actual outbound data — real numbers, no pitch. If it shows a gap, you'll know exactly how big. If it doesn't, I'll tell you to stay put and mean it."\n\n` +
        `Suggested follow-up cadence: send this reply today, add a value-drip every 5 days, and trigger a direct ask on day 21.`
      );
      setGenerating(false);
    }, 1400);
  };

  const copyGenerated = () => {
    if (!generated) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <ShieldCheck className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">Objection Handler</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Battle-tested rebuttals built on LAER &amp; SPIN — 47 playbook entries, live effectiveness scoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5">
          <BookOpen className="h-4 w-4 text-gold" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">This month</p>
            <p className="text-xs font-semibold text-white">1,847 objections countered · <span className="text-emerald-400">+12% win rate</span></p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search objections — try &quot;budget&quot;, &quot;competitor&quot;, &quot;next quarter&quot;…"
            className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gold/40"
          />
        </div>
        <p className="text-xs text-gray-500">
          {q ? `${visibleCategories.reduce((n, c) => n + c.objections.length, 0)} matching objections` : `${CATEGORIES.reduce((n, c) => n + c.objections.length, 0)} objections across 5 categories`}
        </p>
      </div>

      {/* Categorized accordions */}
      <div className="space-y-3">
        {visibleCategories.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">No playbook entries match &quot;{query}&quot;.</p>
            <p className="mt-1 text-xs text-gray-500">Try the custom generator below — the agent will draft one live.</p>
          </div>
        )}

        {visibleCategories.map((cat, ci) => {
          const Icon = cat.icon;
          const expanded = q ? true : (openCategories[cat.id] ?? false);
          const avgEff = Math.round(cat.objections.reduce((n, o) => n + o.effectiveness, 0) / cat.objections.length);
          return (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A]">
              {/* Accordion header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 ${CATEGORY_COLORS[ci % CATEGORY_COLORS.length]}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{cat.name}</p>
                    <p className="text-[11px] text-gray-500">{cat.blurb}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${avgEff}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-gold">{avgEff}% eff.</span>
                  </div>
                  <span className="rounded-md bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold">{cat.objections.length} entries</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Accordion body */}
              {expanded && (
                <div className="space-y-2.5 border-t border-white/5 px-4 pb-4 pt-3">
                  {cat.objections.map((o) => {
                    const open = openObjections[o.id] ?? false;
                    return (
                      <div key={o.id} className={`rounded-xl border transition-colors ${open ? "border-gold/25 bg-gold/[0.03]" : "border-white/10 bg-[#141414]"}`}>
                        <button
                          onClick={() => toggleObjection(o.id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                        >
                          <p className="text-sm font-medium italic text-gray-200">{o.text}</p>
                          <div className="flex flex-shrink-0 items-center gap-3">
                            <span className="hidden text-[10px] text-gray-500 sm:inline">used {o.timesUsed}×</span>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-3 w-3 text-gold" />
                              <span className="text-[11px] font-bold text-gold">{o.effectiveness}%</span>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        {open && (
                          <div className="space-y-3 border-t border-white/5 px-4 pb-4 pt-3.5">
                            {o.counters.map((c, idx) => (
                              <div key={idx} className="flex gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gold/15 text-[10px] font-bold text-gold">
                                  {idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                                    <Zap className="h-2.5 w-2.5" />
                                    {c.framework}
                                  </p>
                                  <p className="text-[13px] leading-relaxed text-gray-300">{c.text}</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#111] p-3">
                              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Usage Tip</p>
                                <p className="mt-1 text-xs leading-relaxed text-gray-400">{o.tip}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                                  <span>Effectiveness score</span>
                                  <span className="font-semibold text-gold">{o.effectiveness}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                  <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${o.effectiveness}%` }} />
                                </div>
                              </div>
                              <button
                                onClick={() => { setCustomObjection(o.text.replace(/[“”"]/g, "")); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                              >
                                Regenerate variant
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate Response */}
      <div className="mt-8 rounded-xl border border-gold/20 bg-[#1A1A1A] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/20 bg-gold/10">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-white">Generate a Custom Counter</h2>
            <p className="text-[11px] text-gray-500">Paste any objection — the agent drafts a structured LAER response</p>
          </div>
        </div>

        <textarea
          value={customObjection}
          onChange={(e) => setCustomObjection(e.target.value)}
          rows={3}
          placeholder="e.g. &quot;We only buy through procurement and the process takes 6 months…&quot;"
          className="w-full resize-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm leading-relaxed text-white placeholder-gray-500 outline-none transition-colors focus:border-gold/40"
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="hidden text-[11px] text-gray-500 sm:block">Framework: LAER (Listen · Acknowledge · Explore · Respond)</p>
          <button
            onClick={handleGenerate}
            disabled={!customObjection.trim() || generating}
            className="flex items-center gap-2 rounded-lg bg-gold-gradient px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Crafting counter-response…" : "Generate Response"}
          </button>
        </div>

        {generated && (
          <div className="mt-5 rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-transparent p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                <Sparkles className="h-3 w-3" /> AI Counter-Response
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  <RotateCcw className="h-3 w-3" /> Regenerate
                </button>
                <button
                  onClick={copyGenerated}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm leading-relaxed text-gray-200">
              {generated.split("\n\n").map((para, i) => (
                <p key={i} className={para.startsWith("Suggested follow-up") ? "mt-3 rounded-lg border border-gold/20 bg-gold/5 px-3.5 py-2.5 text-[13px] text-gold/90" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
