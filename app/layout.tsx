import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocketPilot — Never Miss a Court Deadline",
  description:
    "Deadline and case-date tracking built for solo and small law firms. Filing deadlines, hearings, and statutes of limitations in one dashboard.",
  metadataBase: new URL("https://docketpilot-app.vercel.app"),
  openGraph: {
    title: "DocketPilot — Never Miss a Court Deadline",
    description:
      "Deadline and case-date tracking built for solo and small law firms. $9/month, automatic email reminders, free trial.",
    url: "https://docketpilot-app.vercel.app",
    siteName: "DocketPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocketPilot — Never Miss a Court Deadline",
    description:
      "Deadline and case-date tracking built for solo and small law firms. $9/month, automatic email reminders, free trial.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
