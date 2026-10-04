import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";

// Bricolage carries the headlines, its ink traps give the tiles some character; Geist does
// everything a reader skims past. Mono is reserved for numbers.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "News Aggregator",
  description: "Clustered news, international and Tunisia-focused",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} min-h-[100dvh] bg-paper font-sans text-ink antialiased`}
      >
        <TopBar />
        <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 lg:py-6">{children}</main>
      </body>
    </html>
  );
}
