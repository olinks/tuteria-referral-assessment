import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Referral Follow-up — Tuteria Case Study",
  description: "Referral follow-up flow — Tuteria case study",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
