"use client";

import { useState, useEffect, useCallback } from "react";

type Hook = { id: string; text: string; platform: string; emotionType: string; niche: string };
type Product = {
  id: string; title: string; slug: string; published: boolean;
  opportunity: { niche: string; country: string; isDiaspora: boolean };
  hooks?: Hook[];
};

const PLATFORM_META: Record<string, { icon: string; color: string; action: string; tip: string }> = {
  tiktok:    { icon: "🎵", color: "#FF0050", action: "Post TikTok",     tip: "Film 7-sec hook. Use script below. Add link in bio." },
  pinterest: { icon: "📌", color: "#E60023", action: "Create Pin",      tip: "Create new pin. Use title + description below. Link to your guide page." },
  instagram: { icon: "📸", color: "#E1306C", action: "Post Instagram",  tip: "Post image or reel. Copy caption below. Set link in bio to your store." },
  email:     { icon: "📧", color: "#10B981", action: "Send Email",       tip: "Send to your list. Subject + preview text below." },
  twitter:   { icon: "🐦", color: "#1DA1F2", action: "Tweet",           tip: "Post tweet below. Add your guide link." },
};

// 7-day posting rotation — plants across all platforms systematically
const WEEKLY_SCHEDULE = [
  { day: "Monday",    platform: "tiktok",    label: "🎵 TikTok Day",     theme: "Hook 1 — Stop the scroll" },
  { day: "Tuesday",   platform: "pinterest", label: "📌 Pinterest Day",   theme: "Pin 1 — Search optimised" },
  { day: "Wednesday", platform: "instagram", label: "📸 Instagram Day",   theme: "Post 1 — Pain + CTA" },
  { day: "Thursday",  platform: "email",     label: "📧 Email Day",       theme: "Subject blast — urgency" },
  { day: "Friday",    platform: "tiktok",    label: "🎵 TikTok Day 2",   theme: "Hook 2 — Different angle" },
  { day: "Saturday",  platform: "pinterest", label: "📌 Pinterest Day 2", theme: "Pin 2 — Keyword variation" },
  { day: "Sunday",    platform: "twitter",   label: "🐦 Twitter Day",     theme: "Tweet — punchy fact" },
];

export default function SchedulePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected]   = useState<string>("");
  const [hooks, setHooks]          = useState<Hook[]>([]);
  const [copied, setCopied]        = useState<string>("");
  const [weekOffset, setWeekOffset] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/factory");
    if (!res.ok) return;
    const data: Product[] = await res.json();
    setProducts(data.filter((p) => p.published));
    if (data.length > 0 && !selected) setSelected(data[0].id);
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/hooks?productId=${selected}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setHooks(Array.isArray(data) ? data : []))
      .catch(() => setHooks([]));
  }, [selected]);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  // Generate the actual dates for this week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDates = WEEKLY_SCHEDULE.map((s, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      ...s,
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < today && d.toDateString() !== today.toDateString(),
    };
  });

  const selectedProduct = products.find((p) => p.id === selected);

  function getHookForSlot(platform: string, index: number): Hook | undefined {
    const platformHooks = hooks.filter((h) => h.platform === platform);
    return platformHooks[index % Math.max(platformHooks.length, 1)];
  }

  // Track how many times a platform has appeared in the week so far
  const platformCount: Record<string, number> = {};

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Planting Schedule</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Set and forget. One action per day. Every hook, every platform, every week — systematically.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="p-16 text-center rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>No published guides yet</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Publish a guide in the Content Factory to start your planting schedule.
          </p>
        </div>
      ) : (
        <>
          {/* Product selector */}
          <div className="p-4 rounded-xl mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--muted)" }}>
              Planting schedule for
            </label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.opportunity.isDiaspora ? "✈️ " : ""}{p.title}
                </option>
              ))}
            </select>
            {selectedProduct?.slug && (
              <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Guide URL: <span style={{ color: "#6366F1" }}>/guide/{selectedProduct.slug}</span>
                {" · "}
                <a href={`/guide/${selectedProduct.slug}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#6366F1" }}>Preview →</a>
              </div>
            )}
          </div>

          {/* Week nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setWeekOffset(weekOffset - 1)}
              className="px-3 py-1.5 text-xs rounded-lg"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              ← Prev week
            </button>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
            </span>
            <button onClick={() => setWeekOffset(weekOffset + 1)}
              className="px-3 py-1.5 text-xs rounded-lg"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              Next week →
            </button>
          </div>

          {/* Daily slots */}
          <div className="space-y-3">
            {weekDates.map((slot) => {
              platformCount[slot.platform] = (platformCount[slot.platform] ?? 0);
              const hookIndex = platformCount[slot.platform]++;
              const hook = getHookForSlot(slot.platform, hookIndex);
              const meta = PLATFORM_META[slot.platform];

              return (
                <div key={slot.day}
                  style={{
                    background: slot.isToday ? "var(--surface)" : "var(--surface)",
                    border: `1px solid ${slot.isToday ? "#6366F1" : "var(--border)"}`,
                    borderRadius: 12,
                    opacity: slot.isPast ? 0.5 : 1,
                  }}>
                  {/* Slot header */}
                  <div className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider w-20" style={{ color: "var(--muted)" }}>
                      {slot.day}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{slot.date}</div>
                    {slot.isToday && (
                      <span style={{ background: "#6366F120", color: "#818CF8", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 20, border: "1px solid #6366F130" }}>
                        TODAY
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <span style={{ color: meta?.color, fontSize: 16 }}>{meta?.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{slot.label}</span>
                    </div>
                  </div>

                  {/* Slot content */}
                  <div className="px-4 py-3">
                    <div className="text-xs mb-2 font-medium" style={{ color: "var(--muted)" }}>
                      {meta?.tip}
                    </div>
                    {hook ? (
                      <div className="relative">
                        <div className="text-xs p-3 rounded-lg whitespace-pre-line"
                          style={{ background: "var(--surface2)", color: "var(--text)", lineHeight: 1.7, maxHeight: 120, overflow: "hidden" }}>
                          {hook.text.slice(0, 300)}{hook.text.length > 300 ? "…" : ""}
                        </div>
                        <button onClick={() => copy(hook.text, `${slot.day}-${hook.id}`)}
                          className="mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: copied === `${slot.day}-${hook.id}` ? "#10B98120" : "var(--surface2)", color: copied === `${slot.day}-${hook.id}` ? "#10B981" : "var(--muted)", border: "1px solid var(--border)" }}>
                          {copied === `${slot.day}-${hook.id}` ? "✓ Copied!" : "Copy hook"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        No {slot.platform} hooks generated yet. Build the PDF in the Content Factory to generate hooks.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Planting tips */}
          <div className="mt-8 p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>🌾 Farming Tips</div>
            <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
              <div>• <strong style={{ color: "var(--text)" }}>TikTok:</strong> Film yourself reading the HOOK line looking straight at camera. 7 seconds. Then cut.</div>
              <div>• <strong style={{ color: "var(--text)" }}>Pinterest:</strong> Create a simple text-on-image pin using Canva. Link goes to your guide page, not homepage.</div>
              <div>• <strong style={{ color: "var(--text)" }}>Instagram:</strong> Post the hook as a quote card. "link in bio" must point to your /store page.</div>
              <div>• <strong style={{ color: "var(--text)" }}>Email:</strong> If you have no list yet, collect emails on your guide page first. Even 50 subscribers = sales.</div>
              <div>• <strong style={{ color: "var(--text)" }}>Consistency:</strong> One action/day for 30 days outperforms 30 actions on day 1. Plant daily. Harvest monthly.</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
