import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Region 8 Startups | Eastern Visayas Innovation Hub",
    template: "%s | Region 8 Startups",
  },
  description:
    "Discover and explore the thriving startup ecosystem of Eastern Visayas (Region 8) — Leyte, Southern Leyte, Biliran, Samar, Northern Samar, and Eastern Samar.",
  keywords: [
    "Region 8 startups",
    "Eastern Visayas startups",
    "Philippines startup ecosystem",
    "Leyte startups",
    "Samar startups",
    "Biliran startups",
    "startup funding Philippines",
    "DOST TBI",
    "DTI startup programs",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Region 8 Startups | Eastern Visayas Innovation Hub",
    description:
      "Discover and explore the thriving startup ecosystem of Eastern Visayas (Region 8).",
    type: "website",
    url: "/",
    siteName: "Region 8 Startups",
    locale: "en_PH",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "Region 8 Startups logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Region 8 Startups | Eastern Visayas Innovation Hub",
    description:
      "Discover and explore the thriving startup ecosystem of Eastern Visayas (Region 8).",
    images: ["/apple-touch-icon.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Region 8 Startups",
              url: SITE_URL,
              description:
                "The startup ecosystem of Eastern Visayas (Region 8), Philippines.",
              inLanguage: "en-PH",
            }),
          }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
