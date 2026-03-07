import type { Metadata } from "next";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let title = `Petition #${id}`;

  try {
    const client = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    const petition = (await client.readContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "getPetition",
      args: [BigInt(id)],
    })) as { title: string; description: string; signatureCount: bigint };

    if (petition?.title) {
      title = petition.title;
    }

    const desc = petition?.description
      ? petition.description.slice(0, 160)
      : `Sign this petition on-chain. ${petition?.signatureCount?.toString() ?? "0"} signatures so far.`;

    return { title, description: desc };
  } catch {
    // fallback to default title
  }

  return {
    title,
    description: `View and sign Petition #${id} on BasePetition.`,
  };
}

export default function PetitionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
