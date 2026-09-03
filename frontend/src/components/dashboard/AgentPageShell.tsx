"use client";

import { useState } from "react";
import { LucideIcon, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface AgentPageShellProps {
  agentId: string;
  agentName: string;
  description: string;
  platforms: string[];
  icon: LucideIcon;
}

type PlatformOption = "x" | "linkedin" | "both";

export default function AgentPageShell({
  agentId,
  agentName,
  description,
  platforms,
  icon: Icon,
}: AgentPageShellProps) {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<PlatformOption>(
    platforms.length === 1 ? platforms[0] as PlatformOption : "both"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setError(null);
    try {
      const data = await api<{ result: string; output?: string; message?: string }>(
        "/api/agents/execute",
        {
          method: "POST",
          body: JSON.stringify({
            agent_name: agentId,
            platform: platform === "both" ? "x" : platform,
            input: input.trim(),
          }),
        }
      );
      setResponse(data.result || data.output || data.message || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const platformLabel = (p: string) =>
    p === "x" ? "X" : p === "linkedin" ? "LinkedIn" : p;

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gold-gradient">
            {agentName}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {platforms.map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gold/30 text-gold bg-gold/5"
              >
                {platformLabel(p)}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl space-y-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
          Your Prompt
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="Describe what you want this agent to do..."
          className="w-full rounded-xl bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors duration-200 focus:border-gold resize-none"
        />

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Platform selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformOption)}
              className="rounded-lg bg-[#1A1A1A] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-gold transition-colors cursor-pointer"
            >
              {platforms.length > 1 && (
                <option value="both" className="bg-[#1A1A1A]">Both</option>
              )}
              {platforms.includes("x") && (
                <option value="x" className="bg-[#1A1A1A]">X (Twitter)</option>
              )}
              {platforms.includes("linkedin") && (
                <option value="linkedin" className="bg-[#1A1A1A]">LinkedIn</option>
              )}
            </select>
          </div>

          {/* Execute button */}
          <button
            onClick={handleExecute}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-black bg-gold-gradient transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Execute Agent
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Area */}
      {(isLoading || response || error) && (
        <div className="mt-8 max-w-3xl">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Agent Response
          </label>

          {isLoading && (
            <div className="rounded-xl bg-[#1A1A1A] border border-white/10 px-5 py-6 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-gold animate-spin" />
              <span className="text-sm text-gray-400">Agent is processing your request...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-xl bg-red-950/30 border border-red-500/30 px-5 py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Execution Failed</p>
                <p className="text-sm text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {response && !isLoading && (
            <div className="rounded-xl bg-[#1A1A1A] border border-gold/20 px-5 py-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                  Complete
                </span>
              </div>
              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
