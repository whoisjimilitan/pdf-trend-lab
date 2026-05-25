import type { Metadata } from "next";
import { Geist } from "next/font/google";
import AppShell from "./components/AppShell";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com"),
  title: "PDF Seeds — Stop Googling. There's a PDF guide for that.",
  description: "Ask a direct question. We find the step-by-step PDF guide written for your exact situation. Instant download.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Stop Googling. There's a PDF guide for that.",
    description: "Ask a direct question. We find the step-by-step PDF guide written for your exact situation.",
    siteName: "PDF Seeds",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stop Googling. There's a PDF guide for that.",
    description: "Ask a direct question. We find the step-by-step PDF guide written for your exact situation.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
