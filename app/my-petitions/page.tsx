"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";
import Link from "next/link";

interface Petition {
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
}

function EditModal({
  petition,
  onClose,
}: {
  petition: Petition;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(petition.title);
  const [description, setDescription] = useState(petition.description);
  const [imageUrl, setImageUrl] = useState(petition.imageUrl);
  const [targetGoal, setTargetGoal] = useState(
    petition.targetGoal > 0n ? petition.targetGoal.toString() : "",
  );
  const [deadline, setDeadline] = useState(
    petition.deadline > 0n
      ? new Date(Number(petition.deadline) * 1000).toISOString().slice(0, 16)
      : "",
  );

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const deadlineTimestamp = deadline
      ? BigInt(Math.floor(new Date(deadline).getTime() / 1000))
      : 0n;

    writeContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "updatePetition",
      args: [
        petition.id,
        title.trim(),
        description.trim(),
        imageUrl.trim(),
        BigInt(targetGoal || "0"),
        deadlineTimestamp,
      ],
    });
  };

  if (isSuccess) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "24px",
        }}
        onClick={onClose}
      >
        <div
          className="form-card animate-fade-in"
          style={{
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            padding: "40px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
          <h3 style={{ marginBottom: "8px" }}>Petition Updated!</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            Your changes have been saved on-chain.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Done
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 200,
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        padding: "40px 24px",
      }}
      onClick={onClose}
    >
      <div
        className="form-card animate-fade-in"
        style={{ maxWidth: "560px", width: "100%", height: "fit-content" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Update Petition</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginBottom: "24px",
          }}
        >
          Leave fields empty to keep the current value unchanged.
        </p>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">New Title</label>
            <input
              type="text"
              className="form-input"
              placeholder={petition.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Description</label>
            <textarea
              className="form-textarea"
              placeholder={petition.description || "Add a description..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder={petition.imageUrl || "https://example.com/image.jpg"}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label className="form-label">New Goal</label>
              <input
                type="number"
                className="form-input"
                placeholder={
                  petition.targetGoal > 0n
                    ? petition.targetGoal.toString()
                    : "No goal"
                }
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: "var(--danger-bg)",
                border: "1px solid rgba(248, 113, 113, 0.2)",
                borderRadius: "var(--radius-md)",
                color: "var(--danger)",
                fontSize: "0.85rem",
              }}
            >
              ⚠️{" "}
              {(error as Error).message?.slice(0, 200) || "Transaction failed"}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isPending || isConfirming}
            >
              {isPending ? (
                <>
                  <span className="loading-spinner" /> Confirming...
                </>
              ) : isConfirming ? (
                <>
                  <span className="loading-spinner" /> Updating...
                </>
              ) : (
                "Update Petition"
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function CloseButton({ petitionId }: { petitionId: bigint }) {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  if (isSuccess) {
    return (
      <button className="btn btn-secondary btn-sm" disabled>
        ✓ Closed
      </button>
    );
  }

  return (
    <button
      className="btn btn-danger btn-sm"
      disabled={isPending || isConfirming}
      onClick={() => {
        if (
          confirm(
            "Are you sure you want to close this petition? This cannot be undone.",
          )
        ) {
          writeContract({
            address: PETITION_CONTRACT_ADDRESS,
            abi: PETITION_ABI,
            functionName: "closePetition",
            args: [petitionId],
          });
        }
      }}
    >
      {isPending || isConfirming ? (
        <span className="loading-spinner" />
      ) : (
        "Close"
      )}
    </button>
  );
}

export default function MyPetitionsPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [editingPetition, setEditingPetition] = useState<Petition | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: myPetitions, isLoading } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getMyPetitions",
    account: address,
    query: { enabled: isConnected && mounted },
  });

  const petitions = (myPetitions as Petition[] | undefined) || [];

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="my-petitions-page">
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h3>Connect Your Wallet</h3>
          <p>Connect your wallet to view petitions you&apos;ve created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-petitions-page animate-fade-in-up">
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 800,
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}
      >
        My Petitions
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Manage petitions you&apos;ve created. Edit details or close active
        petitions.
      </p>

      {isLoading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="my-petition-card">
              <div
                className="skeleton"
                style={{ height: "24px", width: "60%", marginBottom: "12px" }}
              />
              <div
                className="skeleton"
                style={{ height: "16px", width: "100%", marginBottom: "4px" }}
              />
              <div
                className="skeleton"
                style={{ height: "16px", width: "40%" }}
              />
            </div>
          ))}
        </div>
      ) : petitions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No petitions yet</h3>
          <p>You haven&apos;t created any petitions. Start one now!</p>
          <Link href="/create" className="btn btn-primary">
            Create a Petition
          </Link>
        </div>
      ) : (
        <div>
          {[...petitions].reverse().map((petition) => {
            const isActive = petition.status === 0;
            const progress =
              petition.targetGoal > 0n
                ? Number((petition.signatureCount * 100n) / petition.targetGoal)
                : 0;

            return (
              <div key={petition.id.toString()} className="my-petition-card">
                <div className="my-petition-header">
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <Link
                        href={`/petition/${petition.id.toString()}`}
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          textDecoration: "none",
                        }}
                      >
                        {petition.title}
                      </Link>
                      <span
                        className={`badge ${isActive ? "badge-active" : "badge-closed"}`}
                      >
                        {isActive ? "Active" : "Closed"}
                      </span>
                    </div>
                    {petition.description && (
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {petition.description}
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <div className="my-petition-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingPetition(petition)}
                      >
                        ✏️ Edit
                      </button>
                      <CloseButton petitionId={petition.id} />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: "12px",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>
                    ✍️ {petition.signatureCount.toString()} signatures
                  </span>
                  {petition.targetGoal > 0n && (
                    <span>🎯 Goal: {petition.targetGoal.toString()}</span>
                  )}
                  {petition.deadline > 0n && (
                    <span>
                      ⏰{" "}
                      {new Date(
                        Number(petition.deadline) * 1000,
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {petition.targetGoal > 0n && (
                  <div className="progress-bar" style={{ marginTop: "8px" }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingPetition && (
        <EditModal
          petition={editingPetition}
          onClose={() => setEditingPetition(null)}
        />
      )}
    </div>
  );
}
