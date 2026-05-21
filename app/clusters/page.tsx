"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Opportunity = {
  id: string; keyword: string; niche: string; opportunityScore: number;
  searchVolume: number; emotionalIntent: string; minPrice: number; maxPrice: number;
};
type Cluster = {
  id: string; name: string; theme: string; emotionalCore: string;
  opportunities: Opportunity[];
};

const EMOTION_COLORS: Record<string, string> = {
  fear: "#EF4444", urgency: "#F59E0B", desire: "#10B981", pain: "#EC4899", confusion: "#6366F1",
};

const S = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 } as React.CSSProperties,
  badge: (c: string): React.CSSProperties => ({ background: c + "20", color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }),
  input: { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8 } as React.CSSProperties,
};

export default function ClustersPage() {
  const router = useRouter();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [unclustered, setUnclustered] = useState<Opportunity[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", theme: "", emotionalCore: "" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/clusters");
    const data = await res.json();
    setClusters(data.clusters);
    setUnclustered(data.unclustered);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createCluster() {
    if (!form.name || selectedIds.length === 0) return;
    await fetch("/api/clusters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, opportunityIds: selectedIds }),
    });
    setForm({ name: "", theme: "", emotionalCore: "" });
    setSelectedIds([]);
    setCreating(false);
    load();
  }

  function toggleSelect(id: string) {
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const totalRevenuePotential = clusters.reduce((acc, c) =>
    acc + c.opportunities.reduce((a, o) => a + o.maxPrice * 50, 0), 0
  );

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Cluster Map</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Group related opportunities into emotional ecosystems. One cluster = one business.
          </p>
        </div>
        <button onClick={() => setCreating(!creating)}
          className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg"
          style={{ background: "var(--accent)" }}>
          + New Cluster
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Clusters", value: clusters.length, color: "#6366F1" },
          { label: "Total Opportunities", value: clusters.reduce((a, c) => a + c.opportunities.length, 0) + unclustered.length, color: "#10B981" },
          { label: "Revenue Potential", value: `$${(totalRevenuePotential / 1000).toFixed(0)}k/mo`, color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} style={S.card} className="p-4">
            <div className="text-2xl font-bold mb-0.5" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Create cluster form */}
      {creating && (
        <div style={S.card} className="p-6 mb-6">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Create New Cluster</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Cluster name (e.g. Debt Stress)" style={S.input}
              className="px-3 py-2.5 text-sm rounded-lg outline-none" />
            <input value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
              placeholder="Theme (e.g. financial recovery)" style={S.input}
              className="px-3 py-2.5 text-sm rounded-lg outline-none" />
            <input value={form.emotionalCore} onChange={e => setForm(p => ({ ...p, emotionalCore: e.target.value }))}
              placeholder="Emotional core (e.g. fear of debt)" style={S.input}
              className="px-3 py-2.5 text-sm rounded-lg outline-none" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
            Select opportunities to group ({selectedIds.length} selected)
          </div>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {unclustered.map((o) => (
              <label key={o.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg"
                style={{ background: selectedIds.includes(o.id) ? "var(--surface2)" : "transparent" }}>
                <input type="checkbox" checked={selectedIds.includes(o.id)} onChange={() => toggleSelect(o.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: "var(--text)" }}>{o.keyword}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{o.niche}</div>
                </div>
                <span style={S.badge(EMOTION_COLORS[o.emotionalIntent] ?? "#6B7280")}>{o.emotionalIntent}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={createCluster}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ background: "var(--accent)" }}>
              Create Cluster
            </button>
            <button onClick={() => setCreating(false)} className="px-5 py-2 text-sm rounded-lg"
              style={{ color: "var(--muted)", background: "var(--surface2)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cluster grid */}
      {clusters.length === 0 && unclustered.length === 0 ? (
        <div style={S.card} className="p-12 text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No opportunities yet. Run the Demand Engine first, then group them into clusters here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {clusters.map((c) => (
            <div key={c.id} style={S.card} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>{c.name}</h3>
                  <div className="flex gap-2">
                    <span style={S.badge("#6366F1")}>{c.theme}</span>
                    <span style={S.badge("#EF4444")}>{c.emotionalCore}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: "#10B981" }}>
                    ${(c.opportunities.reduce((a, o) => a + o.maxPrice * 50, 0) / 1000).toFixed(1)}k/mo
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>potential @ 50 sales each</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {c.opportunities.map((o) => (
                  <div key={o.id} onClick={() => router.push(`/factory?id=${o.id}`)}
                    className="p-3 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                    style={{ background: "var(--surface2)", border: `1px solid ${EMOTION_COLORS[o.emotionalIntent]}30` }}>
                    <div className="text-xs font-medium truncate mb-1" style={{ color: "var(--text)" }}>
                      {o.keyword}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {(o.searchVolume / 1000).toFixed(0)}k/mo
                      </span>
                      <span className="text-xs font-bold" style={{
                        color: o.opportunityScore >= 90 ? "#10B981" : o.opportunityScore >= 80 ? "#F59E0B" : "#6366F1"
                      }}>{o.opportunityScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unclustered */}
          {unclustered.length > 0 && (
            <div style={{ ...S.card, borderStyle: "dashed" }} className="p-6">
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--muted)" }}>
                Unclustered Opportunities ({unclustered.length})
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {unclustered.map((o) => (
                  <div key={o.id} className="p-3 rounded-lg" style={{ background: "var(--surface2)" }}>
                    <div className="text-xs font-medium truncate mb-1" style={{ color: "var(--text)" }}>
                      {o.keyword}
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={S.badge(EMOTION_COLORS[o.emotionalIntent] ?? "#6B7280")}>{o.emotionalIntent}</span>
                      <span className="text-xs font-bold" style={{ color: "#6366F1" }}>{o.opportunityScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
