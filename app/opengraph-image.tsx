import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "On-Chain Petition — Create & Sign Petitions On-Chain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f0a1a 0%, #1a0a2e 40%, #2d1458 70%, #1a0a2e 100%)",
        position: "relative",
      }}
    >
      {/* Purple glow */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Content card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(88, 28, 135, 0.2) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "48px",
          }}
        >
          📄🔗
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          Petitions On-Chain
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 400,
          }}
        >
          Create & Sign Petitions On-Chain
        </div>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          right: "40px",
          fontSize: "18px",
          color: "rgba(255, 255, 255, 0.35)",
          fontWeight: 500,
        }}
      >
        on-chain-petition.app
      </div>
    </div>,
    { ...size },
  );
}
