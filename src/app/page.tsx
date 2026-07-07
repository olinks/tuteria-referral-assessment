import ReferralList from "@/components/ReferralList";
import ReferralForm from "@/components/ReferralForm";

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <div className="logo">T</div>
        <h1>Tuteria Referrals</h1>
      </div>
      <p className="subtitle">
        Send referral follow-up emails when a referred user enrols in a course.
      </p>

      <div className="note">
        <strong>Custom Send:</strong> Fill out the form below to send an email without a database record.
        <br /><br />
        <strong>Database Send:</strong> The UI below lists referral leads from Supabase. Clicking{" "}
        <strong>Send referral email</strong> calls{" "}
        <code>POST /api/referral/send</code>. If the transactional
        provider can&apos;t deliver to a recipient, the API returns a rendered preview instead of failing.
      </div>

      <ReferralForm />

      <h2 style={{ marginTop: "40px", fontSize: "20px" }}>Database Leads</h2>
      <ReferralList />
    </main>
  );
}
