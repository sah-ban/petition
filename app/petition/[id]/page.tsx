"use client";

import { use } from "react";
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";
import Link from "next/link";

interface PetitionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PetitionDetailPage({
  params,
}: PetitionDetailPageProps) {
  const { id } = use(params);
  const petitionId = BigInt(id);
  const { address, isConnected } = useAccount();

  const { data: petition, isLoading } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getPetition",
    args: [petitionId],
  });

  const { data: signersList } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getSigners",
    args: [petitionId],
  });

  const { data: hasSigned } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "hasAddressSigned",
    args: [petitionId, address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: isActive } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "isPetitionActive",
    args: [petitionId],
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSign = () => {
    writeContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "signPetition",
      args: [petitionId],
    });
  };

  if (isLoading) {
    return (
      <div className="detail-page">
        <div
          className="skeleton"
          style={{ height: "40px", width: "60%", marginBottom: "16px" }}
        />
        <div
          className="skeleton"
          style={{ height: "300px", marginBottom: "24px" }}
        />
        <div
          className="skeleton"
          style={{ height: "20px", width: "80%", marginBottom: "8px" }}
        />
        <div className="skeleton" style={{ height: "20px", width: "50%" }} />
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="detail-page">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h3>Petition Not Found</h3>
          <p>This petition does not exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
    createdAt: bigint;
  };

  const progress =
    p.targetGoal > 0n ? Number((p.signatureCount * 100n) / p.targetGoal) : 0;

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "No deadline";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const canSign =
    isConnected && !hasSigned && isActive && !isPending && !isConfirming;

  return (
    <div className="detail-page animate-fade-in-up">
      <Link
        href="/"
        style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "24px",
        }}
      >
        ← Back to all petitions
      </Link>

      <div className="detail-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <span
            className={`badge ${
              p.status !== 0
                ? "badge-closed"
                : !isActive
                  ? "badge-expired"
                  : "badge-active"
            }`}
          >
            {p.status !== 0 ? "Closed" : !isActive ? "Expired" : "Active"}
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Petition #{id}
          </span>
        </div>
        <h1 className="detail-title">{p.title}</h1>
        <div className="detail-creator">
          Created by <code>{truncateAddress(p.creator)}</code>
          <span>on {formatDate(p.createdAt)}</span>
        </div>
      </div>

      {p.imageUrl && (
        <img
          src={p.imageUrl}
          alt={p.title}
          className="detail-image"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {p.description && (
        <div className="detail-description">{p.description}</div>
      )}

      {/* Stats */}
      <div className="detail-stats">
        <div className="detail-stat">
          <div className="detail-stat-value">{p.signatureCount.toString()}</div>
          <div className="detail-stat-label">Signatures</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value">
            {p.targetGoal > 0n ? p.targetGoal.toString() : "∞"}
          </div>
          <div className="detail-stat-label">Goal</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ fontSize: "1rem" }}>
            {formatDate(p.deadline) === "No deadline"
              ? "∞"
              : formatDate(p.deadline).split(",")[0]}
          </div>
          <div className="detail-stat-label">Deadline</div>
        </div>
      </div>

      {/* Progress */}
      {p.targetGoal > 0n && (
        <div style={{ marginBottom: "32px" }}>
          <div className="progress-bar" style={{ height: "10px" }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="progress-text" style={{ marginTop: "8px" }}>
            <span>{progress}% complete</span>
            <span>
              {p.signatureCount.toString()} / {p.targetGoal.toString()}
            </span>
          </div>
        </div>
      )}

      {/* Sign Button */}
      <div style={{ marginBottom: "40px" }}>
        {!isConnected ? (
          <div
            className="form-card"
            style={{ textAlign: "center", padding: "32px" }}
          >
            <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
              Connect your wallet to sign this petition
            </p>
          </div>
        ) : isSuccess ? (
          <div
            style={{
              background: "var(--success-bg)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              textAlign: "center",
              color: "var(--success)",
              fontWeight: 600,
            }}
          >
            ✅ You successfully signed this petition!
          </div>
        ) : hasSigned ? (
          <div
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              textAlign: "center",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            ✅ You have already signed this petition
          </div>
        ) : (
          <>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              onClick={handleSign}
              disabled={!canSign}
            >
              {isPending ? (
                <>
                  <span className="loading-spinner" /> Confirming in Wallet...
                </>
              ) : isConfirming ? (
                <>
                  <span className="loading-spinner" /> Recording Signature...
                </>
              ) : !isActive ? (
                "Petition is no longer active"
              ) : (
                "✍️ Sign This Petition"
              )}
            </button>
            {error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px 16px",
                  background: "var(--danger-bg)",
                  border: "1px solid rgba(248, 113, 113, 0.2)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--danger)",
                  fontSize: "0.85rem",
                }}
              >
                ⚠️{" "}
                {(error as Error).message?.slice(0, 200) ||
                  "Transaction failed"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Signers List */}
      {signersList && (signersList as `0x${string}`[]).length > 0 && (
        <div className="signers-section">
          <h3 className="signers-title">
            Signers ({(signersList as `0x${string}`[]).length})
          </h3>
          {(signersList as `0x${string}`[]).map((signer, i) => (
            <div key={signer + i} className="signer-item">
              <span className="signer-number">#{i + 1}</span>
              <span>{signer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
