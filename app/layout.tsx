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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://basepetition.com";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/farcaster-image`,
  button: {
    title: "Launch BasePetition",
    action: {
      type: "launch_frame",
      name: "BasePetition",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#030B15",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "BasePetition | %s",
    default: "BasePetition | Explore",
  },
  description:
    "Create, sign, and track petitions on the blockchain. Transparent, immutable, and decentralized.",
  other: {
    "fc:frame": JSON.stringify(frame),
    "base:app_id": "69b05684f9731a9f8a820aaa",
  },
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
