"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OvernightSummary { newLeadsToday: number; becameReadyToday: number; repliesToday: number; meetingsToday: number; failuresToday: number; }
interface NextAction { leadId: string; businessName: string; action: string; reason: string; urgency: "low" | "medium" | "high"; contact: { email: string | null; phone: string | null; }; tier: string | null; pipeline: string | null; engagementScore: number | null; }
interface SystemHealth { status: "GREEN" | "YELLOW" | "RED"; statusMessage: string; successfulRunsThisWeek: number; totalRunsThisWeek: number; lastDiscoveryRun: { timestamp: string; status: string; } | null; nextDiscoveryRun: string; campaignOpenRate: number; campaignOpenRateHealth: string; }

export default function Dashboard() {
  const [summary, setSummary] = useState<OvernightSummary | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, actionRes, healthRes] = await Promise.all([
          fetch("/api/dashboard/overnight-summary"),
          fetch("/api/dashboard/next-action"),
          fetch("/api/dashboard/system-health"),
        ]);
        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (actionRes.ok) setNextAction(await actionRes.json());
        if (healthRes.ok) setHealth(await healthRes.json());
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 p-8"><div className="max-w-6xl mx-auto animate-pulse space-y-6"><div className="h-12 bg-gray-200 rounded w-1/4"></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Saint & Story B2B</h1>
            <div className="hidden sm:flex gap-6">
              <Link href="/b2b/dashboard" className="font-medium text-gray-900">Home</Link>
              <Link href="/b2b/leads" className="text-gray-600 hover:text-gray-900">Leads</Link>
              <Link href="/b2b/campaigns" className="text-gray-600 hover:text-gray-900">Campaigns</Link>
              <Link href="/b2b/performance" className="text-gray-600 hover:text-gray-900">Performance</Link>
            </div>
          </div>
          <Link href="/b2b/settings" className="text-gray-600">⚙️</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What Happened Overnight?</h2>
          {summary ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-green-600">+{summary.newLeadsToday}</span><span>new leads discovered</span></div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-green-600">+{summary.becameReadyToday}</span><span>became READY TODAY</span></div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-green-600">+{summary.repliesToday}</span><span>replied to email</span></div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-400">+{summary.meetingsToday}</span><span>meetings booked</span></div>
              {summary.failuresToday > 0 && <div className="flex items-center gap-2 text-red-600 mt-4 pt-4 border-t"><span className="text-2xl font-bold">-{summary.failuresToday}</span> failures</div>}
              {summary.failuresToday === 0 && <div className="mt-4 pt-4 border-t text-green-600 font-medium">🟢 All systems running smoothly</div>}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">Unable to load</div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Next Action</h2>
          {nextAction ? (
            <div className={`border rounded-lg p-6 ${nextAction.urgency === 'high' ? 'bg-red-50 border-red-200' : nextAction.urgency === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              <h3 className="text-xl font-bold mb-2">{nextAction.action}</h3>
              <p className="text-gray-600"><strong>{nextAction.businessName}</strong> {nextAction.reason}</p>
              {nextAction.contact.phone && <a href={`tel:${nextAction.contact.phone}`} className="text-blue-600 hover:underline">{nextAction.contact.phone}</a>}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">No leads requiring action</div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Is The System Healthy?</h2>
          {health ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <p className="text-lg font-bold">{health.status === "GREEN" && "🟢"} {health.statusMessage}</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600">Successful Runs This Week</p><p className="text-2xl font-bold">{health.successfulRunsThisWeek}/{health.totalRunsThisWeek}</p></div>
                <div><p className="text-sm text-gray-600">Campaign Open Rate</p><p className="text-2xl font-bold">{health.campaignOpenRate}%</p></div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">Unable to load</div>
          )}
        </section>
      </div>
    </div>
  );
}
