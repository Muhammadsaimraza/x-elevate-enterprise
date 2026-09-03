"use client";

import { useState } from "react";
import {
  RefreshCw, Database, Check, X, ChevronDown, AlertTriangle,
  CheckCircle2, XCircle, Clock, Zap, Pencil, Loader2,
  Filter, ArrowRight, History, ShieldCheck, Activity, User, Users, Briefcase,
} from "lucide-react";

type RecordType = "Lead" | "Contact" | "Deal";
type LogStatus = "Success" | "Failed" | "Conflict";
type LogAction = "Created" | "Updated" | "Deleted";

interface LogEntry {
  id: number;
  timestamp: string;
  type: RecordType;
  action: LogAction;
  status: LogStatus;
  details: string;
}

const LOG_ENTRIES: LogEntry[] = [
  { id: 1, timestamp: "09:42:18", type: "Contact", action: "Updated", status: "Success", details: "Sarah Kim — job title synced to \u201CVP Revenue Operations\u201D" },
  { id: 2, timestamp: "09:42:15", type: "Deal", action: "Updated", status: "Success", details: "Vertex Systems — stage moved to Proposal ($28.5K)" },
  { id: 3, timestamp: "09:41:58", type: "Lead", action: "Created", status: "Success", details: "New inbound: David Chen (Loopstack) — enriched + intent-scored" },
  { id: 4, timestamp: "09:41:30", type: "Deal", action: "Updated", status: "Conflict", details: "Acme Corp — amount mismatch: local $48,000 vs remote $52,500" },
  { id: 5, timestamp: "09:40:12", type: "Lead", action: "Updated", status: "Failed", details: "Marcus Webb — email enrichment timeout (API 429, retry queued)" },
  { id: 6, timestamp: "09:15:44", type: "Contact", action: "Updated", status: "Success", details: "Elena Rodriguez — last activity timestamp pushed to CRM" },
  { id: 7, timestamp: "09:15:41", type: "Contact", action: "Deleted", status: "Success", details: "Duplicate merged: \u201CS. Kim\u201D collapsed into master record" },
  { id: 8, timestamp: "08:58:02", type: "Deal", action: "Created", status: "Success", details: "Modulr — new deal created from Meeting Qualifier handoff" },
  { id: 9, timestamp: "08:44:19", type: "Lead", action: "Updated", status: "Conflict", details: "Priya Sharma — opt-out flag mismatch between local and remote" },
  { id: 10, timestamp: "08:30:05", type: "Contact", action: "Updated", status: "Success", details: "Tom Becker — engagement score recalculated and synced" },
  { id: 11, timestamp: "07:12:33", type: "Deal", action: "Deleted", status: "Success", details: "Stale sandbox test deal purged (record #41)" },
  { id: 12, timestamp: "02:00:11", type: "Lead", action: "Updated", status: "Success", details: "Nightly batch — 1,128 lead records refreshed" },
];

interface Conflict {
  id: string;
  record: string;
  recordType: RecordType;
  field: string;
  localValue: string;
  remoteValue: string;
  context: string;
}

const CONFLICTS: Conflict[] = [
  {
    id: "cf1",
    record: "Acme Corp",
    recordType: "Deal",
    field: "Amount",
    localValue: "$48,000",
    remoteValue: "$52,500",
    context: "Remote was updated by the AE after a renegotiation call — remote is fresher (2h ago).",
  },
  {
    id: "cf2",
    record: "Sarah Kim",
    recordType: "Contact",
    field: "Job Title",
    localValue: "VP Revenue Operations",
    remoteValue: "Head of RevOps",
    context: "Remote pulled from LinkedIn 2h ago; local came from this morning's enrichment pass.",
  },
  {
    id: "cf3",
    record: "Priya Sharma",
    recordType: "Lead",
    field: "Status",
    localValue: "Opted Out (suppressed)",
    remoteValue: "Active",
    context: "Local suppression was triggered by a negative reply — compliance rules favor keeping local.",
  },
];

interface FieldMapping {
  source: string;
  crm: string;
}

const INITIAL_MAPPINGS: FieldMapping[] = [
  { source: "prospect_name", crm: "contact.full_name" },
  { source: "x_handle", crm: "contact.x_profile_url" },
  { source: "linkedin_url", crm: "contact.linkedin_url" },
  { source: "intent_score", crm: "lead.hs_lead_score" },
  { source: "last_reply_sentiment", crm: "lead.sentiment_tag" },
  { source: "sequence_stage", crm: "lead.cadence_step" },
  { source: "company_domain", crm: "account.domain" },
  { source: "deal_value", crm: "deal.amount" },
  { source: "next_touch_at", crm: "task.due_date" },
];

const TYPE_STYLES: Record<RecordType, { icon: typeof User; cls: string }> = {
  Lead: { icon: Zap, cls: "bg-sky-400/10 text-sky-300 border-sky-400/25" },
  Contact: { icon: User, cls: "bg-gold/10 text-gold border-gold/25" },
  Deal: { icon: Briefcase, cls: "bg-violet-400/10 text-violet-300 border-violet-400/25" },
};

const STATUS_STYLES: Record<LogStatus, { icon: typeof CheckCircle2; cls: string }> = {
  Success: { icon: CheckCircle2, cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25" },
  Failed: { icon: XCircle, cls: "bg-rose-400/10 text-rose-300 border-rose-400/25" },
  Conflict: { icon: AlertTriangle, cls: "bg-amber-400/10 text-amber-300 border-amber-400/25" },
};

type SyncPhase = "idle" | "confirm" | "syncing" | "done";

export default function CrmSynchronizerPage() {
  const [statusFilter, setStatusFilter] = useState<LogStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RecordType | "all">("all");
  const [openConflicts, setOpenConflicts] = useState<Record<string, boolean>>({ cf1: true });
  const [resolutions, setResolutions] = useState<Record<string, "local" | "remote" | "merge">>({});
  const [mappings, setMappings] = useState(INITIAL_MAPPINGS);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [syncCount, setSyncCount] = useState(1284);

  const filtered = LOG_ENTRIES.filter(
    (e) => (statusFilter === "all" || e.status === statusFilter) && (typeFilter === "all" || e.type === typeFilter)
  );

  const statusCounts = {
    all: LOG_ENTRIES.length,
    Success: LOG_ENTRIES.filter((e) => e.status === "Success").length,
    Failed: LOG_ENTRIES.filter((e) => e.status === "Failed").length,
    Conflict: LOG_ENTRIES.filter((e) => e.status === "Conflict").length,
  };

  const openConflictsCount = CONFLICTS.filter((c) => !resolutions[c.id]).length;

  const resolveConflict = (id: string, choice: "local" | "remote" | "merge") => {
    setResolutions((prev) => ({ ...prev, [id]: choice }));
  };

  const startEdit = (source: string, current: string) => {
    setEditingField(source);
    setEditValue(current);
  };

  const saveEdit = (source: string) => {
    if (!editValue.trim()) return;
    setMappings((prev) => prev.map((m) => (m.source === source ? { ...m, crm: editValue.trim() } : m)));
    setEditingField(null);
  };

  const forceSync = () => {
    if (syncPhase === "idle") {
      setSyncPhase("confirm");
      setTimeout(() => setSyncPhase((p) => (p === "confirm" ? "idle" : p)), 4000);
    } else if (syncPhase === "confirm") {
      setSyncPhase("syncing");
      setTimeout(() => {
        setSyncPhase("done");
        setSyncCount((c) => c + 87);
        setTimeout(() => setSyncPhase("idle"), 3500);
      }, 2400);
    }
  };

  const RESOLUTION_LABELS: Record<string, string> = {
    local: "Kept local value",
    remote: "Kept remote value",
    merge: "Merged manually",
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <RefreshCw className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-gold-gradient sm:text-3xl">CRM Synchronizer</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Two-way sync between X-Elevate and HubSpot — 99.2% record-level success rate
            </p>
          </div>
        </div>

        {/* Force sync button with confirmation state */}
        <button
          onClick={forceSync}
          disabled={syncPhase === "syncing"}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
            syncPhase === "confirm"
              ? "border border-amber-400/40 bg-amber-400/10 text-amber-300 animate-pulse-glow"
              : syncPhase === "syncing"
              ? "cursor-wait border border-gold/30 bg-gold/10 text-gold"
              : syncPhase === "done"
              ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "bg-gold-gradient text-black hover:scale-[1.02]"
          }`}
        >
          {syncPhase === "syncing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : syncPhase === "confirm" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : syncPhase === "done" ? (
            <Check className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncPhase === "confirm"
            ? "Click again to confirm"
            : syncPhase === "syncing"
            ? "Syncing 1,284 records…"
            : syncPhase === "done"
            ? "Sync complete — 87 updated"
            : "Force Sync Now"}
        </button>
      </div>

      {syncPhase === "syncing" && (
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gold-gradient" />
        </div>
      )}

      {/* Sync status dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/10">
              <History className="h-4 w-4 text-gold" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-400">18 min ago</span>
          </div>
          <p className="mt-3.5 text-xl font-extrabold text-white">Today, 09:42</p>
          <p className="mt-0.5 text-[11px] text-gray-500">Last successful sync</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/10">
              <Database className="h-4 w-4 text-gold" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400">+87 today</span>
          </div>
          <p className="mt-3.5 text-xl font-extrabold text-white">{syncCount.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-gray-500">Records synced (24h)</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Operational
            </span>
          </div>
          <p className="mt-3.5 text-xl font-extrabold text-white">Healthy</p>
          <p className="mt-0.5 text-[11px] text-gray-500">99.2% success · {openConflictsCount} conflicts open</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/10">
              <Clock className="h-4 w-4 text-gold" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">recurring</span>
          </div>
          <p className="mt-3.5 text-xl font-extrabold text-white">Tonight, 02:00</p>
          <p className="mt-0.5 text-[11px] text-gray-500">Next scheduled full sync</p>
        </div>
      </div>

      {/* Activity log */}
      <div className="mb-6 rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Activity className="h-4 w-4 text-gold" />
            Sync Activity Log
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <Filter className="h-3 w-3" /> Status
            </span>
            {(["all", "Success", "Failed", "Conflict"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-md border px-2 py-1 text-[10px] font-bold transition-all ${
                  statusFilter === f ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 text-gray-500 hover:text-white"
                }`}
              >
                {f} ({statusCounts[f as keyof typeof statusCounts]})
              </button>
            ))}
            <span className="ml-2 hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:flex">
              <Users className="h-3 w-3" /> Type
            </span>
            {(["all", "Lead", "Contact", "Deal"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`hidden rounded-md border px-2 py-1 text-[10px] font-bold transition-all sm:block ${
                  typeFilter === f ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 text-gray-500 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Record Type</th>
                <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Action</th>
                <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="pb-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500">No log entries match the current filters.</td>
                </tr>
              )}
              {filtered.map((e) => {
                const typeMeta = TYPE_STYLES[e.type];
                const TypeIcon = typeMeta.icon;
                const statusMeta = STATUS_STYLES[e.status];
                const StatusIcon = statusMeta.icon;
                return (
                  <tr key={e.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-mono text-[11px] text-gray-500">{e.timestamp}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold ${typeMeta.cls}`}>
                        <TypeIcon className="h-3 w-3" />
                        {e.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium text-white">{e.action}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusMeta.cls}`}>
                        <StatusIcon className="h-3 w-3" />
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400">{e.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Conflict resolution */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              Conflict Resolution
            </h2>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
              openConflictsCount === 0
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/25 bg-amber-400/10 text-amber-300"
            }`}>
              {openConflictsCount === 0 ? "All resolved" : `${openConflictsCount} open`}
            </span>
          </div>

          <div className="space-y-2.5">
            {CONFLICTS.map((c) => {
              const open = openConflicts[c.id] ?? false;
              const resolved = resolutions[c.id];
              return (
                <div key={c.id} className={`rounded-xl border transition-colors ${resolved ? "border-emerald-400/20 bg-emerald-400/[0.03]" : open ? "border-amber-400/25 bg-amber-400/[0.03]" : "border-white/10 bg-[#141414]"}`}>
                  <button
                    onClick={() => setOpenConflicts((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${TYPE_STYLES[c.recordType].cls}`}>
                        {c.recordType}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {c.record} <span className="font-normal text-gray-500">— {c.field}</span>
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Local: <span className="text-gold/90">{c.localValue}</span> · Remote: <span className="text-sky-300">{c.remoteValue}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="border-t border-white/5 px-4 pb-4 pt-3">
                      <p className="text-[11px] leading-relaxed text-gray-400">{c.context}</p>
                      {resolved ? (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <p className="text-[11px] font-semibold text-emerald-300">
                            Resolved — {RESOLUTION_LABELS[resolved]}. Synced to both systems.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => resolveConflict(c.id, "local")}
                            className="rounded-lg border border-gold/30 bg-gold/10 px-2 py-2 text-[11px] font-bold text-gold transition-colors hover:bg-gold/20"
                          >
                            Keep Local
                          </button>
                          <button
                            onClick={() => resolveConflict(c.id, "remote")}
                            className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-2 py-2 text-[11px] font-bold text-sky-300 transition-colors hover:bg-sky-400/20"
                          >
                            Keep Remote
                          </button>
                          <button
                            onClick={() => resolveConflict(c.id, "merge")}
                            className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-[11px] font-bold text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                          >
                            Manual Merge
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Field mapping configuration */}
        <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Database className="h-4 w-4 text-gold" />
              Field Mapping Configuration
            </h2>
            <span className="text-[10px] text-gray-500">X-Elevate → HubSpot</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Source Field</th>
                  <th className="pb-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">CRM Field</th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">Edit</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => {
                  const editing = editingField === m.source;
                  return (
                    <tr key={m.source} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-[11px] text-gray-400">{m.source}</td>
                      <td className="py-2.5 pr-4">
                        {editing ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveEdit(m.source)}
                              autoFocus
                              className="w-full max-w-[220px] rounded-md border border-gold/40 bg-[#141414] px-2 py-1 font-mono text-[11px] text-white outline-none"
                            />
                            <button
                              onClick={() => saveEdit(m.source)}
                              className="flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300"
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2 font-mono text-[11px] text-white">
                            <ArrowRight className="h-3 w-3 text-gray-600" />
                            {m.crm}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => (editing ? setEditingField(null) : startEdit(m.source, m.crm))}
                          className={`rounded-md border p-1.5 transition-colors ${
                            editing
                              ? "border-white/20 text-gray-400 hover:text-white"
                              : "border-white/10 text-gray-500 hover:border-gold/30 hover:text-gold"
                          }`}
                        >
                          {editing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-white/10 bg-[#141414] p-3">
            <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold" />
            <p className="text-[11px] leading-relaxed text-gray-400">
              Mapping changes propagate on the next sync cycle. Nightly batch runs at 02:00 — unmapped fields fall back to CRM defaults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
