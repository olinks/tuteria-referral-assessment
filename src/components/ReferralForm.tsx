"use client";

import { useState } from "react";

interface SendResult {
  status: "sent" | "preview";
  id?: string;
  error?: string;
  preview?: { subject: string; html: string };
}

export default function ReferralForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | { error: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      referrerName: formData.get("referrerName"),
      referrerEmail: formData.get("referrerEmail"),
      referredName: formData.get("referredName"),
      courseName: formData.get("courseName"),
      currency: formData.get("currency"),
      referralAmount: Number(formData.get("referralAmount")),
    };

    try {
      const res = await fetch("/api/referral/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      setResult(json.result as SendResult);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Send failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}>Send Custom Referral Email</h3>
      <form onSubmit={handleSubmit} className="custom-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="referrerName">Referrer Name</label>
            <input type="text" id="referrerName" name="referrerName" required placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="referrerEmail">Referrer Email</label>
            <input type="email" id="referrerEmail" name="referrerEmail" required placeholder="john@example.com" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="referredName">Referred User Name</label>
            <input type="text" id="referredName" name="referredName" required placeholder="e.g. Jane Smith" />
          </div>
          <div className="form-group">
            <label htmlFor="courseName">Course Name</label>
            <input type="text" id="courseName" name="courseName" required placeholder="e.g. Web Development" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select id="currency" name="currency" required>
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="referralAmount">Referral Amount</label>
            <input type="number" id="referralAmount" name="referralAmount" required placeholder="e.g. 5000" min="0" step="0.01" />
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send referral email"}
          </button>
        </div>
      </form>

      {result && "error" in result && (
        <div className="status error" style={{ marginTop: "16px" }}>Error: {result.error}</div>
      )}

      {result && "status" in result && (
        <div style={{ marginTop: "24px" }}>
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
                title="preview-custom"
                srcDoc={result.preview.html}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
