"use client";

import { useState } from "react";
import {
  Send, Play, Pause, Plus, Clock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Users,
  Zap, ArrowRight, Mail, MessageSquare, Share2
} from "lucide-react";

interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Paused" | "Draft";
  progress: number;
  prospects: number;
  sent: number;
  sendRate: string;
  platform: string;
}

interface QueueItem {
  id: number;
  name: string;
  company: string;
  scheduledTime: string;
  platform: "X DM" | "LinkedIn InMail" | "Email";
  step: number;
  totalSteps: number;
  status: "Queued" | "Sending" | "Sent" | "Failed";
}

const campaigns: Campaign[] = [
  { id: 1, name: "Enterprise SaaS Q3 Outreach", status: "Active", progress: 62, prospects: 2000, sent: 1240, sendRate: "48/day", platform: "Multi-channel" },
  { id: 2, name: "Fintech Founders Sequence", status: "Active", progress: 59, prospects: 1500, sent: 890, sendRate: "36/day", platform: "LinkedIn" },
  { id: 3, name: "Healthcare IT Leaders", status: "Paused", progress: 54, prospects: 800, sent: 430, sendRate: "—", platform: "Email + X" },
  { id: 4, name: "Series B Startup Blitz", status: "Draft", progress: 0, prospects: 600, sent: 0, sendRate: "—", platform: "Multi-channel" },
];

const queueItems: QueueItem[] = [
  { id: 1, name: "Sarah Chen", company: "NovaPay", scheduledTime: "Today, 2:00 PM", platform: "LinkedIn InMail", step: 1, totalSteps: 3, status: "Sending" },
  { id: 2, name: "Marcus Webb", company: "CloudStack AI", scheduledTime: "Today, 2:15 PM", platform: "X DM", step: 2, totalSteps: 3, status: "Queued" },
  { id: 3, name: "Priya Sharma", company: "HealthGrid", scheduledTime: "Today, 2:30 PM", platform: "Email", step: 1, totalSteps: 3, status: "Queued" },
  { id: 4, name: "Lisa Park", company: "FinEdge", scheduledTime: "Today, 3:00 PM", platform: "LinkedIn InMail", step: 3, totalSteps: 3, status: "Queued" },
  { id: 5, name: "Tom Erikson", company: "DataForge", scheduledTime: "Today, 1:45 PM", platform: "X DM", step: 2, totalSteps: 3, status: "Sent" },
  { id: 6, name: "James O'Brien", company: "CyberVault", scheduledTime: "Today, 1:30 PM", platform: "Email", step: 1, totalSteps: 3, status: "Sent" },
  { id: 7, name: "Andre Williams", company: "ScaleOps", scheduledTime: "Today, 1:00 PM", platform: "LinkedIn InMail", step: 1, totalSteps: 3, status: "Failed" },
  { id: 8, name: "Rachel Kim", company: "MedTech Solutions", scheduledTime: "Tomorrow, 9:00 AM", platform: "X DM", step: 1, totalSteps: 3, status: "Queued" },
];

export default function OutreachOperatorPage() {
  const [campaignStatuses, setCampaignStatuses] = useState<Record<number, string>>(
    Object.fromEntries(campaigns.map(c => [c.id, c.status]))
  );
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);

  const toggleCampaignStatus = (id: number) => {
    setCampaignStatuses(prev => {
      const current = prev[id];
      const next = current === "Active" ? "Paused" : current === "Paused" ? "Active" : current;
      return { ...prev, [id]: next };
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Paused": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Draft": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const queueStatusIcon = (status: string) => {
    switch (status) {
      case "Queued": return <Clock className="w-4 h-4 text-gray-400" />;
      case "Sending": return <Zap className="w-4 h-4 text-gold animate-pulse" />;
      case "Sent": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "Failed": return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const platformIcon = (platform: string) => {
    if (platform.includes("LinkedIn")) return <Share2 className="w-3.5 h-3.5 text-blue-400" />;
    if (platform.includes("X DM")) return <span className="text-white font-bold text-[10px]">𝕏</span>;
    return <Mail className="w-3.5 h-3.5 text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Send className="w-7 h-7 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">Outreach Operator</h1>
          <p className="text-gray-400 text-sm mt-1">Campaign Launchpad &bull; {campaigns.filter(c => campaignStatuses[c.id] === "Active").length} active campaigns</p>
        </div>
      </div>

      {/* Campaign Cards */}
      <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-gold" />
        Active Campaigns
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {campaigns.map((campaign, i) => (
          <div
            key={campaign.id}
            className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 hover:border-gold/20 transition animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">{campaign.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(campaignStatuses[campaign.id])}`}>
                    {campaignStatuses[campaign.id]}
                  </span>
                  <span className="text-[10px] text-gray-500">{campaign.platform}</span>
                </div>
              </div>
              {campaignStatuses[campaign.id] !== "Draft" && (
                <button
                  onClick={() => toggleCampaignStatus(campaign.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition"
                  title={campaignStatuses[campaign.id] === "Active" ? "Pause" : "Resume"}
                >
                  {campaignStatuses[campaign.id] === "Active" ? (
                    <Pause className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Play className="w-4 h-4 text-green-400" />
                  )}
                </button>
              )}
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {campaign.sent.toLocaleString()} / {campaign.prospects.toLocaleString()} sent
                </span>
                <span>{campaign.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-gradient rounded-full transition-all duration-500"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Send rate: {campaign.sendRate}</span>
              <button
                onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                className="text-gold hover:underline flex items-center gap-1"
              >
                Details
                {expandedCampaign === campaign.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Sequence Visualization */}
            {expandedCampaign === campaign.id && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 mb-3">Outreach Sequence</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                        campaign.progress > (step - 1) * 33
                          ? "bg-gold/10 border-gold/30 text-gold"
                          : "bg-white/5 border-white/10 text-gray-600"
                      }`}>
                        {step}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {step === 1 ? "Initial" : step === 2 ? "Follow-up" : "Close"}
                      </span>
                      {step < 3 && <ArrowRight className="w-3 h-3 text-gray-700" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sending Queue */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden mb-10">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" />
            Sending Queue
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prospect</th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {queueItems.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.company}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{item.scheduledTime}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {platformIcon(item.platform)}
                      <span className="text-xs text-gray-400">{item.platform}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: item.totalSteps }, (_, idx) => (
                        <div
                          key={idx}
                          className={`w-5 h-1.5 rounded-full ${
                            idx < item.step ? "bg-gold" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Step {item.step}/{item.totalSteps}</p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {queueStatusIcon(item.status)}
                      <span className={`text-xs ${
                        item.status === "Sent" ? "text-green-400" :
                        item.status === "Sending" ? "text-gold" :
                        item.status === "Failed" ? "text-red-400" :
                        "text-gray-500"
                      }`}>{item.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Campaign Builder */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold" />
            <span className="text-sm font-heading font-semibold">New Campaign</span>
          </div>
          {showBuilder ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showBuilder && (
          <div className="p-5 border-t border-white/10 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Campaign Name</label>
              <input
                placeholder="e.g., Enterprise SaaS Q4 Outreach"
                className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 transition"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Platform</label>
                <select className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition appearance-none">
                  <option>Multi-channel (X + LinkedIn + Email)</option>
                  <option>LinkedIn Only</option>
                  <option>X DM Only</option>
                  <option>Email Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Daily Send Limit</label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Sequence Steps</label>
              <div className="flex items-center gap-3">
                {["Initial Message", "Follow-up 1 (Day 3)", "Follow-up 2 (Day 7)"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300">
                      {step}
                    </div>
                    {i < 2 && <ArrowRight className="w-3 h-3 text-gray-700" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button className="bg-gold-gradient text-black font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition text-sm">
                <MessageSquare className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
