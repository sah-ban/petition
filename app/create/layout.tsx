import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create",
  description:
    "Start a petition and gather on-chain signatures for your cause on Base.",
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
