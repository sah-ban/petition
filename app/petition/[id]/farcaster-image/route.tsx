import { ImageResponse } from "next/og";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";

export const alt = "Petition — BasePetition";
export const size = { width: 1200, height: 800 }; // 3:2 Farcaster spec
export const contentType = "image/png";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let title = `Petition #${id}`;
  let description = "Sign this petition on BasePetition";
  let signatures = "0";
  let goal = "∞";
  let status = "Active";
  let imageUrl: string | null = null;

  try {
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL),
    });

    const petition = await client.readContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "getPetition",
      args: [BigInt(id)],
    });

    const p = petition as {
      id: bigint;
      creator: `0x${string}`;
      title: string;
      description: string;
      imageUrl: string;
      targetGoal: bigint;
      deadline: bigint;
      signatureCount: bigint;
      status: number;
    };

    title = p.title || title;
    description = p.description || description;
    signatures = p.signatureCount.toString();
    goal = p.targetGoal > 0n ? p.targetGoal.toString() : "∞";
    status = p.status === 0 ? "Active" : "Closed";
    imageUrl = p.imageUrl || null;
  } catch (err) {
    console.error("=== FC IMAGE ERROR ===", err);
  }

  const truncatedDesc =
    description.length > 140 ? description.slice(0, 140) + "..." : description;

  const progress = goal !== "∞" ? (Number(signatures) / Number(goal)) * 100 : 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#0f071f",
        backgroundImage: "linear-gradient(to bottom right, #0f071f, #2e1065)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              B
            </div>
            <span
              style={{ fontSize: "32px", fontWeight: 700, color: "#e2e8f0" }}
            >
              BasePetition
            </span>
          </div>
          <div
            style={{
              display: "flex",
              background:
                status === "Active"
                  ? "rgba(52, 211, 153, 0.15)"
                  : "rgba(248, 113, 113, 0.15)",
              border: `2px solid ${
                status === "Active"
                  ? "rgba(52, 211, 153, 0.4)"
                  : "rgba(248, 113, 113, 0.4)"
              }`,
              color: status === "Active" ? "#34d399" : "#f87171",
              padding: "10px 24px",
              borderRadius: "9999px",
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            {status} • Petition #{id}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "48px",
            marginTop: "auto",
            marginBottom: "auto",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "24px",
                color: "#f8fafc",
                wordWrap: "break-word",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "32px",
                color: "#c4b5fd",
                lineHeight: 1.4,
                opacity: 0.9,
              }}
            >
              {truncatedDesc}
            </div>
          </div>

          {imageUrl ? (
            <div
              style={{
                display: "flex",
                width: "420px" /* Increased slightly for 3:2 layout */,
                height: "420px",
                borderRadius: "24px",
                overflow: "hidden",
                border: "4px solid rgba(139, 92, 246, 0.3)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                flexShrink: 0,
                backgroundColor: "#1e1b4b",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt=""
              />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#ffffff", display: "flex", gap: "12px" }}>
              <span>{signatures}</span>
              <span style={{ color: "#a78bfa", fontWeight: 500 }}>
                Signatures
              </span>
            </span>
            <span style={{ color: "#ffffff", display: "flex", gap: "12px" }}>
              <span>{goal !== "∞" ? goal : ""}</span>
              <span style={{ color: "#a78bfa", fontWeight: 500 }}>
                {goal !== "∞" ? "Target" : "No Limit"}
              </span>
            </span>
          </div>

          {goal !== "∞" && (
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "16px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "99px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: `${clampedProgress}%`,
                  height: "100%",
                  background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
                  borderRadius: "99px",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
