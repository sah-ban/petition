import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about BasePetition, on-chain signatures, and managing your wallet.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
