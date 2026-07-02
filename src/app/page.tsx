import ReferralList from "@/components/ReferralList";

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <div className="logo">M</div>
        <h1>Medbuddy Referrals</h1>
      </div>
      <p className="subtitle">
        Send referral follow-up emails when a referred user enrols in a course.
      </p>

      <div className="note">
        This UI lists referral leads from Supabase. Clicking{" "}
        <strong>Send referral email</strong> calls{" "}
        <code>POST /api/referral/send</code>, which composes the same context
        as the original snippet and dispatches via Resend. If the transactional
        provider can&apos;t deliver to a recipient (e.g. an unverified address on
        a new account), the API returns a rendered preview instead of failing.
      </div>

      <ReferralList />
    </main>
  );
}
