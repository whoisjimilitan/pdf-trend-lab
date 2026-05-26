import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com"),
  title: "PDF Seeds - Stop Googling. Describe your situation.",
  description: "Tell us what you're trying to figure out. You get a step-by-step guide specific to your country and situation - not ten links and a rabbit hole.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Stop Googling. Describe your situation.",
    description: "Tell us what you're trying to figure out. You get a step-by-step guide specific to your country and situation - not ten links and a rabbit hole.",
    siteName: "PDF Seeds",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stop Googling. Describe your situation.",
    description: "Tell us what you're trying to figure out. You get a step-by-step guide specific to your country and situation - not ten links and a rabbit hole.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
