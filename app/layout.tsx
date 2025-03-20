import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/app/lib/fontawesome";
import Header from "@/app/ui/header";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Metadata configuration
export const metadata: Metadata = {
  title: {
    template: "%s | AI CAD Analyzer",
    default: "AI CAD Analyzer - Intelligent Design Analysis",
  },
  description: "Advanced CAD analysis and design verification powered by AI",
  keywords: ["CAD", "AI", "Design", "Analysis", "Engineering"],
  authors: [{ name: "Your Name" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "AI CAD Analyzer",
    description: "Advanced CAD analysis and design verification powered by AI",
    siteName: "AI CAD Analyzer",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden bg-background antialiased">
        <div className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
