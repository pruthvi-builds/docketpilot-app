import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocketPilot — Never Miss a Court Deadline",
  description:
    "Deadline and case-date tracking built for solo and small law firms. Filing deadlines, hearings, and statutes of limitations in one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
