import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Petitions",
  description: "Manage, edit, and track the petitions you've created on-chain.",
};

export default function MyPetitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
