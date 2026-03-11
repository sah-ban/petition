"use client";

import { useState, useEffect } from "react";

import { use } from "react";
import {
  useReadContract,
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useEnsName,
} from "wagmi";
import { encodeFunctionData } from "viem";
import {
  PETITION_ABI,
  PETITION_CONTRACT_ADDRESS,
  BASE_CHAIN_ID,
} from "@/lib/contract";
import { withAttribution } from "@/lib/attribution";
import Link from "next/link";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import sdk from "@farcaster/miniapp-sdk";

interface PetitionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PetitionDetailPage({
  params,
}: PetitionDetailPageProps) {
  const { id } = use(params);
  const petitionId = BigInt(id);
  const { address, isConnected } = useAccount();

  const {
    data: petition,
    isLoading,
    refetch: refetchPetition,
  } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getPetition",
    args: [petitionId],
    chainId: BASE_CHAIN_ID,
  });

  const { data: signersList, refetch: refetchSigners } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getSigners",
    args: [petitionId],
    chainId: BASE_CHAIN_ID,
  });

  const { data: hasSigned } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "hasAddressSigned",
    args: [petitionId, address as `0x${string}`],
    query: { enabled: !!address },
    chainId: BASE_CHAIN_ID,
  });

  const { data: isActive } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "isPetitionActive",
    args: [petitionId],
    chainId: BASE_CHAIN_ID,
  });

  const { data: owner } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "owner",
    chainId: BASE_CHAIN_ID,
  });

  const { sendTransaction, data: txHash, isPending, error } = useSendTransaction();

  const { data: ensName } = useEnsName({
    address: petition
      ? (petition as { creator: `0x${string}` }).creator
      : undefined,
    chainId: 1,
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchPetition();
      refetchSigners();
    }
  }, [isSuccess, refetchPetition, refetchSigners]);

  const handleSign = () => {
    sendTransaction({
      to: PETITION_CONTRACT_ADDRESS,
      data: withAttribution(
        encodeFunctionData({
          abi: PETITION_ABI,
          functionName: "signPetition",
          args: [petitionId],
        })
      ),
      chainId: BASE_CHAIN_ID,
    });
  };

  const [copied, setCopied] = useState<string | null>(null);

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
      <div
        className="detail-page"
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h3>Petition Not Found</h3>
          <p>This petition does not exist or has been archived.</p>
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
    isHidden: boolean;
  };

  const progress =
    p.targetGoal > 0n ? Number((p.signatureCount * 100n) / p.targetGoal) : 0;

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return { date: "No deadline", time: "" };
    const date = new Date(Number(timestamp) * 1000);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const canSign =
    isConnected && !hasSigned && isActive && !isPending && !isConfirming;

  const petitionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/petition/${id}`
      : `/petition/${id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${p.title} — ${petitionUrl}`);
      setCopied("url");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `${p.title}\n\nSign this petition on @BasePetition 👇`,
    );
    const url = encodeURIComponent(petitionUrl);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFarcaster = async () => {
    try {
      if (typeof window !== "undefined") {
        const shareText = `${p.title}\n\nSign this petition on @basepetition 👇`;
        const isMiniApp = await sdk.isInMiniApp();

        if (isMiniApp) {
          await sdk.actions.composeCast({
            text: shareText,
            embeds: [petitionUrl],
          });
        } else {
          const encodedText = encodeURIComponent(shareText);
          const encodedEmbed = encodeURIComponent(petitionUrl);
          window.open(
            `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedEmbed}`,
            "_blank",
            "noopener,noreferrer",
          );
        }
      }
    } catch (err) {
      console.error("Failed to share to farcaster", err);
    }
  };

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

      {p.isHidden && (
        <div
          style={{
            background: "var(--danger-bg, #fee2e2)",
            color: "var(--danger, #ef4444)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            marginBottom: "24px",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          ⚠️ This petition is hidden and requires admin review.
        </div>
      )}

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
        <div className="detail-creator" style={{ alignItems: "center" }}>
          Created by{" "}
          <code title={p.creator}>
            {ensName || truncateAddress(p.creator)}
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                verticalAlign: "middle",
                padding: "0 2px",
                minWidth: "unset",
                lineHeight: 1,
                cursor: "pointer",
                background: "none",
                border: "none",
                color: "inherit",
              }}
              onClick={async () => {
                await navigator.clipboard.writeText(p.creator);
                setCopied("creator");
                setTimeout(() => setCopied(null), 1500);
              }}
            >
              {copied === "creator" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ width: "14px", height: "14px" }}
                >
                  <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
                  <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: "14px", height: "14px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
              )}
            </button>
          </code>
          <span>
            on {formatDate(p.createdAt).date} {formatDate(p.createdAt).time}
          </span>
        </div>

        {/* Share buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyUrl}
            style={{ minWidth: "120px" }}
          >
            {copied === "url" ? "✓ Copied!" : "Copy URL"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleShareX}>
            Share on 𝕏
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleShareFarcaster}

          >
            Share on Farcaster
          </button>

          {isConnected && owner && address === owner && (
            <button
              className={`btn ${p.isHidden ? "btn-primary" : "btn-danger"} btn-sm`}
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to ${p.isHidden ? "UNHIDE" : "HIDE"} this petition?`,
                  )
                ) {
                  sendTransaction({
                    to: PETITION_CONTRACT_ADDRESS,
                    data: withAttribution(
                      encodeFunctionData({
                        abi: PETITION_ABI,
                        functionName: "togglePetitionVisibility",
                        args: [petitionId],
                      })
                    ),
                    chainId: BASE_CHAIN_ID,
                  });
                }
              }}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming
                ? "⏳"
                : p.isHidden
                  ? "👁️ Unhide Petition"
                  : "🚫 Hide Petition"}
            </button>
          )}
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
            {p.targetGoal > 0n ? p.targetGoal.toString() : "N/A"}
          </div>
          <div className="detail-stat-label">Goal</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-value" style={{ fontSize: "1rem" }}>
            {p.deadline === 0n ? (
              "N/A"
            ) : (
              <>
                <div>{formatDate(p.deadline).date}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  {formatDate(p.deadline).time}
                </div>
              </>
            )}
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
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CustomConnectButton />
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "12px",
                fontSize: "0.9rem",
              }}
            >
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
              <span style={{ flex: 1 }}>{truncateAddress(signer)}</span>
              <button
                className="btn btn-secondary"
                style={{
                  padding: "4px 8px",
                  minWidth: "unset",
                  lineHeight: 1,
                }}
                onClick={async () => {
                  await navigator.clipboard.writeText(signer);
                  setCopied(signer);
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === signer ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ width: "16px", height: "16px" }}
                  >
                    <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
                    <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "16px", height: "16px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
