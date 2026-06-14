"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  business_name: string;
  business_category: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  lead_tier: string | null;
  pipeline_stage: string | null;
  engagement_score: number | null;
  last_engagement_at: string | null;
  last_engagement_type: string | null;
  source: string | null;
  engaged_today: boolean | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readyTodayOnly, setReadyTodayOnly] = useState(false);
  const [tierFilter, setTierFilter] = useState<string[]>(["READY", "INTERESTED", "NEW"]);
  const [pipelineFilter, setPipelineFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/b2b/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    // READY TODAY filter (takes precedence)
    if (readyTodayOnly) {
      filtered = filtered.filter((l) => l.engaged_today && l.lead_tier === "READY");
    } else {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.business_name?.toLowerCase().includes(searchLower) ||
            l.email?.toLowerCase().includes(searchLower) ||
            l.phone?.includes(search)
        );
      }

      // Tier filter
      if (tierFilter.length > 0) {
        filtered = filtered.filter((l) => tierFilter.includes(l.lead_tier || "NEW"));
      }
    }

    // Pipeline filter
    if (pipelineFilter.length > 0) {
      filtered = filtered.filter((l) => pipelineFilter.includes(l.pipeline_stage || "NEW"));
    }

    // Category filter
    if (categoryFilter.length > 0) {
      filtered = filtered.filter((l) => categoryFilter.includes(l.business_category || ""));
    }

    // Sort: READY TODAY first, then by score
    filtered.sort((a, b) => {
      if (a.engaged_today && !b.engaged_today) return -1;
      if (!a.engaged_today && b.engaged_today) return 1;
      return (b.engagement_score || 0) - (a.engagement_score || 0);
    });

    setFilteredLeads(filtered);
  }, [leads, search, tierFilter, pipelineFilter, categoryFilter]);

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "READY":
        return "bg-red-100 text-red-800";
      case "INTERESTED":
        return "bg-yellow-100 text-yellow-800";
      case "NEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPipelineColor = (stage: string | null) => {
    switch (stage) {
      case "WON":
        return "text-green-600";
      case "QUALIFIED":
        return "text-blue-600";
      case "ENGAGED":
        return "text-purple-600";
      case "CONTACTED":
        return "text-gray-600";
      case "NEW":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "never";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white h-16 rounded border"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Saint & Story B2B</h1>
            <div className="hidden sm:flex gap-6">
              <Link href="/b2b/dashboard" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/b2b/leads" className="font-medium text-gray-900">
                Leads
              </Link>
              <Link href="/b2b/campaigns" className="text-gray-600 hover:text-gray-900">
                Campaigns
              </Link>
              <Link href="/b2b/performance" className="text-gray-600 hover:text-gray-900">
                Performance
              </Link>
            </div>
          </div>
          <Link href="/b2b/settings" className="text-gray-600">
            ⚙️
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header & Search */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Leads — {leads.length} total</h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
            />

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">🔴 READY Leads</label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setReadyTodayOnly(!readyTodayOnly);
                      setSearch("");
                      setTierFilter(["READY", "INTERESTED", "NEW"]);
                      setPipelineFilter([]);
                      setCategoryFilter([]);
                    }}
                    className={`px-4 py-2 rounded font-medium ${
                      readyTodayOnly
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🔴 READY TODAY (Engaged last 24h)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lead Tier</label>
                <div className="flex gap-2">
                  {["READY", "INTERESTED", "NEW"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() =>
                        setTierFilter(
                          tierFilter.includes(tier) ? tierFilter.filter((t) => t !== tier) : [...tierFilter, tier]
                        )
                      }
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        tierFilter.includes(tier)
                          ? tier === "READY"
                            ? "bg-red-600 text-white"
                            : tier === "INTERESTED"
                            ? "bg-yellow-600 text-white"
                            : "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pipeline Stage</label>
                <div className="flex gap-2 flex-wrap">
                  {["NEW", "CONTACTED", "ENGAGED", "QUALIFIED", "WON", "LOST"].map((stage) => (
                    <button
                      key={stage}
                      onClick={() =>
                        setPipelineFilter(
                          pipelineFilter.includes(stage)
                            ? pipelineFilter.filter((s) => s !== stage)
                            : [...pipelineFilter, stage]
                        )
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        pipelineFilter.includes(stage)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Business</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tier</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Pipeline</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Engagement</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {lead.engaged_today && <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2"></span>}
                      {lead.business_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.business_category || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTierColor(lead.lead_tier)}`}>
                        {lead.lead_tier || "NEW"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${getPipelineColor(lead.pipeline_stage)}`}>
                      {lead.pipeline_stage || "NEW"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.last_engagement_type ? `${lead.last_engagement_type} ${formatTime(lead.last_engagement_at)}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No leads match your filters.</p>
            </div>
          )}
        </div>

        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLeads.length} of {leads.length} leads
          {tierFilter.length > 0 && ` (tier: ${tierFilter.join(", ")})`}
          {pipelineFilter.length > 0 && ` (pipeline: ${pipelineFilter.join(", ")})`}
        </div>
      </div>

      {/* Detail Drawer (Stub for Phase 3.4B) */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full sm:w-96 h-screen sm:h-auto sm:max-h-screen overflow-y-auto rounded-t-lg sm:rounded-lg p-6">
            <button
              onClick={() => setSelectedLead(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl mb-4"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{selectedLead.business_name}</h3>
            <div className="space-y-3 text-sm">
              {selectedLead.email && (
                <p>
                  <strong>Email:</strong> <a href={`mailto:${selectedLead.email}`} className="text-blue-600">{selectedLead.email}</a>
                </p>
              )}
              {selectedLead.phone && (
                <p>
                  <strong>Phone:</strong> <a href={`tel:${selectedLead.phone}`} className="text-blue-600">{selectedLead.phone}</a>
                </p>
              )}
              {selectedLead.website && (
                <p>
                  <strong>Website:</strong> <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{selectedLead.website}</a>
                </p>
              )}
              <p><strong>Tier:</strong> {selectedLead.lead_tier}</p>
              <p><strong>Pipeline:</strong> {selectedLead.pipeline_stage}</p>
              {selectedLead.last_engagement_type && (
                <p><strong>Last Action:</strong> {selectedLead.last_engagement_type} {formatTime(selectedLead.last_engagement_at)}</p>
              )}
              <p className="text-xs text-gray-500">Lead detail drawer complete in Phase 3.4B</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
