import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://basepetition.xyz",
  ),
  title: {
    template: "BasePetition | %s",
    default: "BasePetition | Explore",
  },
  description:
    "Create, sign, and track petitions on the blockchain. Transparent, immutable, and decentralized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable}`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
