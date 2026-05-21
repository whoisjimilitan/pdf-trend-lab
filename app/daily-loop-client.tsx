"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Loop = {
  id: string; date: string; status: string; niche: string; keyword: string;
  pdfDone: boolean; hooksDone: boolean; published: boolean; notes: string | null;
};
type Opportunity = {
  id: string; keyword: string; niche: string; opportunityScore: number;
  searchVolume: number; emotionalIntent: string; trend: string;
};

const S = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 } as React.CSSProperties,
  badge: (color: string): React.CSSProperties => ({ background: color + "20", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }),
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#10B981" : score >= 80 ? "#F59E0B" : score >= 70 ? "#6366F1" : "#EF4444";
  const label = score >= 90 ? "🟢 High Demand" : score >= 80 ? "🟡 Strong" : score >= 70 ? "🟠 Good" : "🔴 Low";
  return <span style={S.badge(color)}>{label} {score}</span>;
}

export default function DailyLoopClient({
  loops, todayLoop, today, recentOpportunities, stats,
}: {
  loops: Loop[];
  todayLoop: Loop | null;
  today: string;
  recentOpportunities: Opportunity[];
  stats: { totalProducts: number; totalHooks: number; totalOpportunities: number };
}) {
  const router = useRouter();
  const [form, setForm] = useState({ niche: "", keyword: "" });
  const [saving, setSaving] = useState(false);

  async function startToday() {
    if (!form.niche || !form.keyword) return;
    setSaving(true);
    await fetch("/api/daily-loop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: today }),
    });
    setSaving(false);
    router.refresh();
  }

  async function toggle(id: string, field: string, value: boolean) {
    await fetch("/api/daily-loop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, field, value }),
    });
    router.refresh();
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Daily Loop</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Pull demand → Build assets → Publish → Repeat. Every day.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Opportunities Found", value: stats.totalOpportunities, color: "#6366F1" },
          { label: "Products Created", value: stats.totalProducts, color: "#10B981" },
          { label: "Hooks Generated", value: stats.totalHooks, color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} style={S.card} className="p-5">
            <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Today's loop */}
        <div style={S.card} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Today — {today}</h2>
            {todayLoop && <span style={S.badge(todayLoop.published ? "#10B981" : "#6366F1")}>
              {todayLoop.published ? "Published" : "In Progress"}
            </span>}
          </div>

          {!todayLoop ? (
            <div className="space-y-3">
              <input
                value={form.niche}
                onChange={e => setForm(p => ({ ...p, niche: e.target.value }))}
                placeholder="Niche (e.g. personal finance)"
                className="w-full text-sm px-3 py-2.5 rounded-lg outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <input
                value={form.keyword}
                onChange={e => setForm(p => ({ ...p, keyword: e.target.value }))}
                placeholder="Today's keyword / pain point"
                className="w-full text-sm px-3 py-2.5 rounded-lg outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <button
                onClick={startToday}
                disabled={saving}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                style={{ background: "var(--accent)" }}
              >
                {saving ? "Starting…" : "⚡ Start Today's Loop"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--text)" }}>{todayLoop.keyword}</span>
                <span className="mx-2">·</span>{todayLoop.niche}
              </div>
              {[
                { key: "pdfDone", label: "PDF + all assets generated", done: todayLoop.pdfDone },
                { key: "hooksDone", label: "Hooks & content posted", done: todayLoop.hooksDone },
                { key: "published", label: "Product published", done: todayLoop.published },
              ].map(({ key, label, done }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={done}
                    onChange={e => toggle(todayLoop.id, key, e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm" style={{ color: done ? "var(--text)" : "var(--muted)", textDecoration: done ? "line-through" : "none" }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Recent opportunities */}
        <div style={S.card} className="p-6">
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>
            Recent Opportunities
          </h2>
          {recentOpportunities.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No opportunities yet. Run the Demand Engine to find your first winning topic.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOpportunities.map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium truncate max-w-48" style={{ color: "var(--text)" }}>
                      {o.keyword}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {(o.searchVolume / 1000).toFixed(0)}k searches/mo · {o.emotionalIntent}
                    </div>
                  </div>
                  <ScoreBadge score={o.opportunityScore} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loop history */}
      <div style={S.card} className="p-6">
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Loop History</h2>
        {loops.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No loops yet. Start your first one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--muted)" }} className="text-xs uppercase tracking-wider">
                <th className="text-left pb-3">Date</th>
                <th className="text-left pb-3">Keyword</th>
                <th className="text-left pb-3">Niche</th>
                <th className="text-left pb-3">PDF</th>
                <th className="text-left pb-3">Hooks</th>
                <th className="text-left pb-3">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {loops.map((l) => (
                <tr key={l.id}>
                  <td className="py-3" style={{ color: "var(--muted)" }}>{l.date}</td>
                  <td className="py-3 font-medium max-w-48 truncate" style={{ color: "var(--text)" }}>{l.keyword}</td>
                  <td className="py-3" style={{ color: "var(--muted)" }}>{l.niche}</td>
                  <td className="py-3">{l.pdfDone ? "✅" : "⬜"}</td>
                  <td className="py-3">{l.hooksDone ? "✅" : "⬜"}</td>
                  <td className="py-3">{l.published ? "✅" : "⬜"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
