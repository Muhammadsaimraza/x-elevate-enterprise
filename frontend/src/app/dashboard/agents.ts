import {
  Crown, Radar, Filter, Building2,
  DatabaseZap, Gauge, PenTool, Send,
  MessageCircle, ShieldCheck, CalendarClock, CalendarCheck,
  TrendingUp, LayoutDashboard, Target, RefreshCw
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  platforms: ("x" | "linkedin")[];
  icon: LucideIcon;
}

export const AGENTS: Agent[] = [
  {
    id: "head-of-sales",
    name: "Head of Sales",
    description: "Orchestrates the entire outbound sales swarm, coordinates agent handoffs, and ensures pipeline targets are hit on schedule.",
    platforms: ["x", "linkedin"],
    icon: Crown,
  },
  {
    id: "signal-hunter",
    name: "Signal Hunter",
    description: "Scans social feeds, industry forums, and news for buying signals like funding rounds, hiring sprees, and leadership changes.",
    platforms: ["x", "linkedin"],
    icon: Radar,
  },
  {
    id: "icp-analyst",
    name: "ICP Analyst",
    description: "Defines and refines the Ideal Customer Profile using firmographic, technographic, and behavioral data to sharpen targeting.",
    platforms: ["linkedin"],
    icon: Filter,
  },
  {
    id: "account-researcher",
    name: "Account Researcher",
    description: "Deep-dives into target accounts — org charts, recent news, tech stack, and pain points — to build actionable intel dossiers.",
    platforms: ["x", "linkedin"],
    icon: Building2,
  },
  {
    id: "lead-enricher",
    name: "Lead Enricher",
    description: "Appends missing contact details, job titles, email patterns, and social profiles to turn raw leads into sales-ready records.",
    platforms: ["x", "linkedin"],
    icon: DatabaseZap,
  },
  {
    id: "intent-scorer",
    name: "Intent Scorer",
    description: "Analyzes engagement signals and behavioral data to score prospect intent, surfacing the hottest leads for immediate outreach.",
    platforms: ["x", "linkedin"],
    icon: Gauge,
  },
  {
    id: "cross-platform-copywriter",
    name: "Cross-Platform Copywriter",
    description: "Crafts personalized cold DMs, connection requests, and follow-up messages tuned to each platform's tone and character limits.",
    platforms: ["x", "linkedin"],
    icon: PenTool,
  },
  {
    id: "outreach-operator",
    name: "Outreach Operator",
    description: "Executes multi-step outbound sequences across X DMs and LinkedIn InMail, respecting send limits and personalization tokens.",
    platforms: ["x", "linkedin"],
    icon: Send,
  },
  {
    id: "reply-analyst",
    name: "Reply Analyst",
    description: "Reads and classifies inbound replies — interested, objection, OOO, or irrelevant — and routes them to the right next action.",
    platforms: ["x", "linkedin"],
    icon: MessageCircle,
  },
  {
    id: "objection-handler",
    name: "Objection Handler",
    description: "Generates context-aware rebuttals to common sales objections using proven frameworks like LAER and SPIN.",
    platforms: ["x", "linkedin"],
    icon: ShieldCheck,
  },
  {
    id: "follow-up-orchestrator",
    name: "Follow-up Orchestrator",
    description: "Schedules and sequences multi-touch follow-ups across channels, adjusting cadence based on prospect engagement signals.",
    platforms: ["x", "linkedin"],
    icon: CalendarClock,
  },
  {
    id: "meeting-qualifier",
    name: "Meeting Qualifier",
    description: "Pre-qualifies booked meetings against BANT/MEDDIC criteria and generates discovery agendas to maximize conversion.",
    platforms: ["linkedin"],
    icon: CalendarCheck,
  },
  {
    id: "pipeline-analyst",
    name: "Pipeline Analyst",
    description: "Tracks deal velocity, stage conversion rates, and pipeline health metrics to forecast revenue and spot bottlenecks.",
    platforms: ["x", "linkedin"],
    icon: TrendingUp,
  },
  {
    id: "sales-manager",
    name: "Sales Manager",
    description: "Aggregates agent activity across the swarm into a real-time ops dashboard with KPIs, win rates, and rep performance.",
    platforms: ["x", "linkedin"],
    icon: LayoutDashboard,
  },
  {
    id: "inbound-strategist",
    name: "Inbound Strategist",
    description: "Converts inbound interest signals — content engagement, demo requests, pricing page visits — into qualified sales conversations.",
    platforms: ["x", "linkedin"],
    icon: Target,
  },
  {
    id: "crm-synchronizer",
    name: "CRM Synchronizer",
    description: "Keeps the CRM clean and up-to-date by syncing lead data, activity logs, and deal stages across all connected platforms.",
    platforms: ["x", "linkedin"],
    icon: RefreshCw,
  },
];
