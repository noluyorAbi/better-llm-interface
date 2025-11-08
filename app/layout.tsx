import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bt.adatepe.dev";
const siteName = "Intelligent LLM Interface";
const siteDescription =
  "A modern, intelligent interface for Large Language Model interactions. Features context-aware widget suggestions, intuitive organization tools, and adaptive personalization to enhance productivity and user satisfaction.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "LLM",
    "Large Language Model",
    "AI Interface",
    "Chat Interface",
    "Intelligent UI",
    "Bachelor Thesis",
    "LMU",
    "Context-Aware",
    "Smart Widgets",
    "OpenAI",
    "GPT-4",
    "AI Chat",
    "Next.js",
    "TypeScript",
    "Supabase",
  ],
  authors: [
    {
      name: "Alperen Adatepe",
      url: "https://adatepe.dev",
    },
  ],
  creator: "Alperen Adatepe",
  publisher: "Ludwig Maximilian University of Munich",
  applicationName: siteName,
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Intelligent LLM Interface - Modern AI Interaction Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Intelligent LLM Interface - Modern AI Interaction Platform",
      },
    ],
    creator: "@noluyorAbi",
    site: "@noluyorAbi",
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  category: "technology",
  other: {
    "og:image:secure_url": "/og",
    "og:image:type": "image/png",
    classification: "Technology, AI, Education",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
