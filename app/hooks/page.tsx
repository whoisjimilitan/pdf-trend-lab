"use client";

import { useState, useEffect, useCallback } from "react";

type Hook = {
  id: string; text: string; platform: string; emotionType: string;
  niche: string; usageCount: number; createdAt: string;
  opportunity?: { keyword: string } | null;
};

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#EF4444", instagram: "#EC4899", twitter: "#6366F1",
  pinterest: "#F59E0B", email: "#10B981",
};
const EMOTION_COLORS: Record<string, string> = {
  fear: "#EF4444", curiosity: "#6366F1", urgency: "#F59E0B",
  transformation: "#10B981", mistake: "#EC4899",
};

const S = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 } as React.CSSProperties,
  badge: (c: string): React.CSSProperties => ({ background: c + "20", color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }),
  chip: (active: boolean, c: string): React.CSSProperties => ({
    background: active ? c + "20" : "var(--surface2)", color: active ? c : "var(--muted)",
    border: `1px solid ${active ? c + "40" : "var(--border)"}`, borderRadius: 20,
    padding: "4px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer",
  }),
};

export default function HooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [platform, setPlatform] = useState("");
  const [emotion, setEmotion] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (platform) params.set("platform", platform);
    if (emotion) params.set("emotionType", emotion);
    const res = await fetch(`/api/hooks?${params}`);
    setHooks(await res.json());
  }, [platform, emotion]);

  useEffect(() => { load(); }, [load]);

  async function markUsed(id: string) {
    await fetch("/api/hooks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    markUsed(id);
    setTimeout(() => setCopied(""), 2000);
  }

  const platforms = ["tiktok", "instagram", "twitter", "pinterest", "email"];
  const emotions = ["fear", "curiosity", "urgency", "transformation", "mistake"];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Hook Library</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Every hook ever generated. Filtered by platform, emotion, reusable across niches.
        </p>
      </div>

      {/* Filters */}
      <div style={S.card} className="p-5 mb-6 space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Platform</div>
          <div className="flex gap-2 flex-wrap">
            <button style={S.chip(!platform, "#6366F1")} onClick={() => setPlatform("")}>All</button>
            {platforms.map(p => (
              <button key={p} style={S.chip(platform === p, PLATFORM_COLORS[p])} onClick={() => setPlatform(platform === p ? "" : p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Emotion Type</div>
          <div className="flex gap-2 flex-wrap">
            <button style={S.chip(!emotion, "#6366F1")} onClick={() => setEmotion("")}>All</button>
            {emotions.map(e => (
              <button key={e} style={S.chip(emotion === e, EMOTION_COLORS[e])} onClick={() => setEmotion(emotion === e ? "" : e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hooks.length === 0 ? (
        <div style={S.card} className="p-12 text-center">
          <div className="text-4xl mb-3">🎣</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No hooks yet. Generate content in the Content Factory to build your hook library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {hooks.map((h) => (
            <div key={h.id} style={S.card} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span style={S.badge(PLATFORM_COLORS[h.platform] ?? "#6B7280")}>{h.platform}</span>
                <span style={S.badge(EMOTION_COLORS[h.emotionType] ?? "#6B7280")}>{h.emotionType}</span>
                {h.usageCount > 0 && (
                  <span style={S.badge("#6B7280")}>used {h.usageCount}×</span>
                )}
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
                "{h.text}"
              </p>
              {h.opportunity && (
                <div className="text-xs mb-3 truncate" style={{ color: "var(--muted)" }}>
                  from: {h.opportunity.keyword}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{h.niche}</span>
                <button onClick={() => copy(h.text, h.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                  style={S.badge("#6366F1")}>
                  {copied === h.id ? "✓ Copied!" : "Copy Hook"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
