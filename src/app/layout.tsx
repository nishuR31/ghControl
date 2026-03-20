import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gh-control.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GH Control",
    template: "%s | GH Control",
  },
  description:
    "Personal GitHub command center - Manage repos, workflows, webhooks, and jobs from a single dashboard",
  applicationName: "GH Control",
  keywords: [
    "GitHub dashboard",
    "GitHub control panel",
    "GitHub automation",
    "GitHub webhooks",
    "GitHub jobs",
    "BullMQ",
    "Redis",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "GH Control",
    description:
      "Power-user GitHub command center for repos, pull requests, webhooks, notifications, and job operations.",
    type: "website",
    url: siteUrl,
    siteName: "GH Control",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GH Control",
    description: "Consolidated GitHub command center",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
