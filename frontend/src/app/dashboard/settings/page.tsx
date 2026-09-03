"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";

interface LinkedAccountsData {
  x_handle: string;
  linkedin_profile_url: string;
  x_connected: boolean;
  linkedin_connected: boolean;
}

interface SettingsFormData {
  x_auth_token: string;
  linkedin_li_at: string;
  x_handle: string;
  linkedin_profile_url: string;
}

type ToastState = { type: "success" | "error"; message: string } | null;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [xConnected, setXConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [showXToken, setShowXToken] = useState(false);
  const [showLinkedinToken, setShowLinkedinToken] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    defaultValues: {
      x_auth_token: "",
      linkedin_li_at: "",
      x_handle: "",
      linkedin_profile_url: "",
    },
  });

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: LinkedAccountsData = await api("/api/settings/linked-accounts");
      reset({
        x_handle: data.x_handle || "",
        linkedin_profile_url: data.linkedin_profile_url || "",
        x_auth_token: "",
        linkedin_li_at: "",
      });
      setXConnected(data.x_connected);
      setLinkedinConnected(data.linkedin_connected);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load settings";
      setToast({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsSaving(true);

      const payload: Record<string, string> = {};
      if (data.x_auth_token) payload.x_auth_token = data.x_auth_token;
      if (data.linkedin_li_at) payload.linkedin_li_at = data.linkedin_li_at;
      if (data.x_handle) payload.x_handle = data.x_handle;
      if (data.linkedin_profile_url) payload.linkedin_profile_url = data.linkedin_profile_url;

      await api("/api/settings/linked-accounts", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setToast({ type: "success", message: "Settings saved successfully." });

      // Re-fetch to update connection statuses
      await fetchSettings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-7 h-7 text-gold animate-spin" />
          <span className="text-sm text-gray-500 font-medium tracking-wide">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-gold-gradient">
          Settings
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
          Connect your X and LinkedIn accounts to power the outbound sales swarm.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ── X (Twitter) Card ── */}
        <section className="rounded-xl bg-[#1A1A1A] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
                <span className="text-gold font-bold text-sm">𝕏</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">X (Twitter)</h2>
                <p className="text-xs text-gray-500">Authentication &amp; profile handle</p>
              </div>
            </div>
            <StatusBadge connected={xConnected} />
          </div>

          <div className="space-y-5">
            {/* X auth token */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Auth Token
              </label>
              <div className="relative">
                <input
                  type={showXToken ? "text" : "password"}
                  placeholder="Paste your X auth_token"
                  className="w-full rounded-lg bg-[#111] border border-white/10 px-4 py-2.5 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                  {...register("x_auth_token")}
                />
                <button
                  type="button"
                  onClick={() => setShowXToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showXToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-600">
                Leave blank to keep the current token unchanged.
              </p>
            </div>

            {/* X handle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                X Handle
              </label>
              <input
                type="text"
                placeholder="@yourhandle"
                className="w-full rounded-lg bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                {...register("x_handle")}
              />
            </div>
          </div>
        </section>

        {/* ── LinkedIn Card ── */}
        <section className="rounded-xl bg-[#1A1A1A] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
                <span className="text-gold font-bold text-sm">in</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">LinkedIn</h2>
                <p className="text-xs text-gray-500">Authentication &amp; profile URL</p>
              </div>
            </div>
            <StatusBadge connected={linkedinConnected} />
          </div>

          <div className="space-y-5">
            {/* LinkedIn li_at */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                li_at Cookie
              </label>
              <div className="relative">
                <input
                  type={showLinkedinToken ? "text" : "password"}
                  placeholder="Paste your LinkedIn li_at cookie"
                  className="w-full rounded-lg bg-[#111] border border-white/10 px-4 py-2.5 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                  {...register("linkedin_li_at")}
                />
                <button
                  type="button"
                  onClick={() => setShowLinkedinToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showLinkedinToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-600">
                Leave blank to keep the current cookie unchanged.
              </p>
            </div>

            {/* LinkedIn profile URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Profile URL
              </label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full rounded-lg bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                {...register("linkedin_profile_url")}
              />
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="flex items-center justify-end gap-4">
          {isDirty && (
            <span className="text-xs text-gray-500">Unsaved changes</span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-gradient px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Helper components ── */

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border ${
        connected
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-gray-600/30 bg-gray-600/10 text-gray-500"
      }`}
    >
      {connected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      {connected ? "Connected" : "Not Connected"}
    </div>
  );
}
