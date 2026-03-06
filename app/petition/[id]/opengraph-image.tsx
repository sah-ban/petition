import { ImageResponse } from "next/og";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";

export const alt = "Petition — On-Chain Petition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("=== OG IMAGE DEBUG ===");
  console.log("Petition ID:", id);

  let title = `Petition #${id}`;
  let signatures = "—";
  let goal = "∞";
  let status = "Active";

  try {
    const client = createPublicClient({
      chain: sepolia,
  transport: http("https://rpc.sepolia.org"),
    });

    const petition = await client.readContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "getPetition",
      args: [BigInt(id)],
    });

    console.log("=== PETITION DATA ===");
    console.log(
      "Raw petition:",
      JSON.stringify(petition, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );

    const p = petition as {
      title: string;
      signatureCount: bigint;
      targetGoal: bigint;
      status: number;
    };

    title = p.title || title;
    signatures = p.signatureCount.toString();
    goal = p.targetGoal > 0n ? p.targetGoal.toString() : "∞";
    status = p.status === 0 ? "Active" : "Closed";

    console.log(
      "Parsed - title:",
      title,
      "signatures:",
      signatures,
      "goal:",
      goal,
      "status:",
      status,
    );
  } catch (err) {
    console.error("=== OG IMAGE ERROR ===", err);
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a0a2e",
        color: "#ffffff",
        fontSize: "32px",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "48px", fontWeight: 700 }}>{title}</div>
      <div style={{ display: "flex", gap: "32px", color: "#a78bfa" }}>
        <span>{signatures} signatures</span>
        <span>Goal: {goal}</span>
        <span>{status}</span>
      </div>
    </div>,
    { ...size },
  );
}
