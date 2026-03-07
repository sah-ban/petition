import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: "400px",
            margin: "0 auto 32px",
            lineHeight: 1.7,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-primary">
            ← Back to Explore
          </Link>
          <Link href="/create" className="btn btn-secondary">
            Create a Petition
          </Link>
        </div>
      </div>
    </div>
  );
}
