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

export const metadata: Metadata = {
  title: {
    default: "Intelligent LLM Interface",
    template: "%s | Intelligent LLM Interface",
  },
  description:
    "A modern, intelligent interface for Large Language Model interactions. Features context-aware widget suggestions, intuitive organization tools, and adaptive personalization to enhance productivity and user satisfaction.",
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
  ],
  authors: [
    {
      name: "Alperen Adatepe",
      email: "adatepe.alperen@campus.lmu.de",
    },
  ],
  creator: "Alperen Adatepe",
  publisher: "Ludwig Maximilian University of Munich",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Intelligent LLM Interface",
    title: "Intelligent LLM Interface",
    description:
      "A modern, intelligent interface for Large Language Model interactions. Features context-aware widget suggestions, intuitive organization tools, and adaptive personalization.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Intelligent LLM Interface - Modern AI Interaction Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intelligent LLM Interface",
    description:
      "A modern, intelligent interface for Large Language Model interactions with smart widgets and context-aware suggestions.",
    images: ["/og-image.svg"],
    creator: "@noluyorAbi",
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
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  category: "technology",
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
