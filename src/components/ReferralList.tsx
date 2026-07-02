"use client";

import { useEffect, useState } from "react";

interface Person {
  id: string;
  name: string;
  email: string;
}
interface LeadView {
  id: string;
  currency: string;
  referral_amount: number;
  referrer: Person;
  referredUser: Person;
  course: { id: string; name: string };
}

interface SendResult {
  status: "sent" | "preview";
  id?: string;
  error?: string;
  preview?: { subject: string; html: string };
}

export default function ReferralList() {
  const [leads, setLeads] = useState<LeadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SendResult | { error: string }>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leads");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load leads");
        setLeads(json.leads || []);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function send(lead: LeadView) {
    setSendingId(lead.id);
    try {
      const res = await fetch("/api/referral/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId: lead.referrer.id, leadId: lead.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      setResults((r) => ({ ...r, [lead.id]: json.result as SendResult }));
    } catch (e) {
      setResults((r) => ({
        ...r,
        [lead.id]: { error: e instanceof Error ? e.message : "Send failed" },
      }));
    } finally {
      setSendingId(null);
    }
  }

  function money(currency: string, amount: number) {
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  }

  if (loading) return <p className="empty">Loading referral leads…</p>;
  if (loadError)
    return (
      <div className="card">
        <div className="status error">
          Could not load leads: {loadError}. Check Supabase env vars and that
          the schema/seed has been applied.
        </div>
      </div>
    );
  if (leads.length === 0)
    return (
      <p className="empty">
        No referral leads yet. Apply the SQL seed in <code>supabase/</code> to
        populate demo data.
      </p>
    );

  return (
    <div>
      {leads.map((lead) => {
        const result = results[lead.id];
        return (
          <div className="card" key={lead.id}>
            <div className="lead-row">
              <div className="lead-info">
                <h3>
                  {lead.referredUser.name} → {lead.course.name}
                </h3>
                <p>
                  Referred by <strong>{lead.referrer.name}</strong> (
                  {lead.referrer.email})
                </p>
                <p className="reward">
                  Reward: {money(lead.currency, lead.referral_amount)}
                </p>
              </div>
              <button
                onClick={() => send(lead)}
                disabled={sendingId === lead.id}
              >
                {sendingId === lead.id ? "Sending…" : "Send referral email"}
              </button>
            </div>

            {result && "error" in result && (
              <div className="status error">Error: {result.error}</div>
            )}

            {result && "status" in result && (
              <>
                <div className={`status ${result.status}`}>
                  {result.status === "sent"
                    ? `Email sent successfully${result.id ? ` (id: ${result.id})` : ""}.`
                    : `Preview rendered${result.error ? ` — provider note: ${result.error}` : " (no live send)."}`}
                </div>
                {result.preview && (
                  <div className="preview-box">
                    <div className="preview-subject">
                      Subject: {result.preview.subject}
                    </div>
                    <iframe
                      title={`preview-${lead.id}`}
                      srcDoc={result.preview.html}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
