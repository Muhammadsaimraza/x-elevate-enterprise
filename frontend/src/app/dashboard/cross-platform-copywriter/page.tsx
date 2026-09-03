"use client";

import { useState } from "react";
import {
  PenTool, Sparkles, Send, ChevronDown, Copy,
  CheckCircle2, Lightbulb, Eye
} from "lucide-react";

const prospectContext = {
  name: "Sarah Chen",
  company: "NovaPay Technologies",
  title: "VP of Sales",
  insights: [
    "Recently raised $45M Series B",
    "Hiring 12 new Account Executives",
    "Previously at Stripe as Sales Director",
    "Active on LinkedIn posting about outbound strategy",
  ],
};

const toneOptions = ["Professional", "Casual", "Urgent", "Friendly"] as const;
type Tone = typeof toneOptions[number];

const sampleXDraft = `Hi Sarah — congrats on the Series B! Saw you're scaling the sales team. We help fintech companies like NovaPay automate outbound prospecting with AI agents that book 3x more meetings. Would love to show you a 10-min demo. Open to a quick chat?`;

const sampleLinkedinDraft = `Hi Sarah,

Congratulations on NovaPay's impressive $45M Series B — the embedded finance space is on fire right now.

I noticed you're scaling the sales team aggressively, which is exactly the inflection point where our AI-powered outbound platform makes the biggest impact. We help fintech companies automate multi-channel prospecting sequences across X and LinkedIn, typically seeing:

• 3x more qualified meetings booked
• 60% reduction in SDR ramp time
• 40% higher reply rates vs. manual outreach

Given your Stripe background, I think you'd appreciate the data-driven approach we take to personalization at scale.

Would you be open to a 10-minute demo this week? Happy to work around your schedule.

Best regards`;

export default function CrossPlatformCopywriterPage() {
  const [xDraft, setXDraft] = useState(sampleXDraft);
  const [linkedinDraft, setLinkedinDraft] = useState(sampleLinkedinDraft);
  const [tone, setTone] = useState<Tone>("Professional");
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [generatingX, setGeneratingX] = useState(false);
  const [generatingLI, setGeneratingLI] = useState(false);
  const [copiedX, setCopiedX] = useState(false);
  const [copiedLI, setCopiedLI] = useState(false);
  const [showPreviewX, setShowPreviewX] = useState(false);
  const [showPreviewLI, setShowPreviewLI] = useState(false);

  const xCharCount = xDraft.length;
  const xOverLimit = xCharCount > 280;

  const handleGenerate = (platform: "x" | "linkedin") => {
    if (platform === "x") {
      setGeneratingX(true);
      setTimeout(() => setGeneratingX(false), 1500);
    } else {
      setGeneratingLI(true);
      setTimeout(() => setGeneratingLI(false), 1500);
    }
  };

  const handleCopy = (platform: "x" | "linkedin") => {
    const text = platform === "x" ? xDraft : linkedinDraft;
    navigator.clipboard.writeText(text);
    if (platform === "x") { setCopiedX(true); setTimeout(() => setCopiedX(false), 2000); }
    else { setCopiedLI(true); setTimeout(() => setCopiedLI(false), 2000); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <PenTool className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Cross-Platform Copywriter</h1>
          <p className="text-gray-400 text-sm mt-1">Split-Screen Editor &bull; Craft personalized outreach for X & LinkedIn</p>
        </div>
      </div>

      {/* Prospect Context */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-gold" />
          <span className="text-sm font-heading font-semibold">Prospect Context</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <span className="text-xs font-bold text-gold">SC</span>
          </div>
          <div>
            <p className="font-semibold text-sm">{prospectContext.name}</p>
            <p className="text-xs text-gray-500">{prospectContext.title} at {prospectContext.company}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {prospectContext.insights.map((insight, i) => (
            <span key={i} className="text-[11px] px-3 py-1 rounded-full bg-gold/5 text-gold/80 border border-gold/10">
              {insight}
            </span>
          ))}
        </div>
      </div>

      {/* Tone Selector */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-400">Tone:</span>
        <div className="relative">
          <button
            onClick={() => setShowToneMenu(!showToneMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-white hover:border-white/20 transition"
          >
            {tone}
            <ChevronDown className={`w-3 h-3 transition ${showToneMenu ? "rotate-180" : ""}`} />
          </button>
          {showToneMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
              {toneOptions.map(t => (
                <button
                  key={t}
                  onClick={() => { setTone(t); setShowToneMenu(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition ${t === tone ? "text-gold" : "text-gray-400"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* X DM Draft */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-xs">𝕏</span>
              </span>
              <span className="font-semibold text-sm">X DM Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreviewX(!showPreviewX)}
                className="p-1.5 hover:bg-white/5 rounded-md transition text-gray-500 hover:text-white"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopy("x")}
                className="p-1.5 hover:bg-white/5 rounded-md transition text-gray-500 hover:text-white"
                title="Copy"
              >
                {copiedX ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showPreviewX ? (
            <div className="p-5 min-h-[280px]">
              <div className="bg-[#111111] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold">YOU</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">@yourhandle</p>
                    <p className="text-[10px] text-gray-600">now</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${xOverLimit ? "text-red-400" : "text-gray-300"}`}>{xDraft}</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <textarea
                value={xDraft}
                onChange={e => setXDraft(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                placeholder="Write your X DM..."
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <span className={`text-xs font-mono ${xOverLimit ? "text-red-400" : xCharCount > 250 ? "text-amber-400" : "text-gray-500"}`}>
              {xCharCount} / 280
            </span>
            <button
              onClick={() => handleGenerate("x")}
              disabled={generatingX}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:border-gold/30 hover:text-gold transition disabled:opacity-50"
            >
              {generatingX ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI Generate
            </button>
          </div>
        </div>

        {/* LinkedIn Message Draft */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-xs">in</span>
              </span>
              <span className="font-semibold text-sm">LinkedIn Message Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreviewLI(!showPreviewLI)}
                className="p-1.5 hover:bg-white/5 rounded-md transition text-gray-500 hover:text-white"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopy("linkedin")}
                className="p-1.5 hover:bg-white/5 rounded-md transition text-gray-500 hover:text-white"
                title="Copy"
              >
                {copiedLI ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showPreviewLI ? (
            <div className="p-5 min-h-[280px]">
              <div className="bg-[#111111] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold">YOU</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Your Name</p>
                    <p className="text-[10px] text-gray-600">LinkedIn InMail</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{linkedinDraft}</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <textarea
                value={linkedinDraft}
                onChange={e => setLinkedinDraft(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                placeholder="Write your LinkedIn message..."
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <span className="text-xs font-mono text-gray-500">
              {linkedinDraft.length} characters
            </span>
            <button
              onClick={() => handleGenerate("linkedin")}
              disabled={generatingLI}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:border-gold/30 hover:text-gold transition disabled:opacity-50"
            >
              {generatingLI ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI Generate
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button className="bg-gold-gradient text-black font-semibold px-10 py-3.5 rounded-lg flex items-center gap-3 hover:opacity-90 transition animate-pulse-glow text-sm">
          <Send className="w-5 h-5" />
          Send to Outreach
        </button>
      </div>
    </div>
  );
}
