"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PETITION_ABI, PETITION_CONTRACT_ADDRESS } from "@/lib/contract";

export default function CreatePetitionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [deadline, setDeadline] = useState("");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deadlineTimestamp = deadline
      ? BigInt(Math.floor(new Date(deadline).getTime() / 1000))
      : 0n;

    writeContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "createPetition",
      args: [
        title.trim(),
        description.trim(),
        imageUrl.trim(),
        BigInt(targetGoal || "0"),
        deadlineTimestamp,
      ],
    });
  };

  if (isSuccess) {
    return (
      <div className="form-page animate-fade-in-up">
        <div
          className="form-card"
          style={{ textAlign: "center", padding: "60px 32px" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
          <h2
            style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}
          >
            Petition Created!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Your petition has been submitted on-chain.
          </p>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              className="btn btn-primary"
              onClick={() => router.push("/")}
            >
              View All Petitions
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setTitle("");
                setDescription("");
                setImageUrl("");
                setTargetGoal("");
                setDeadline("");
              }}
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page animate-fade-in-up">
      <h1>Create a Petition</h1>
      <p>Start a petition and gather on-chain signatures for your cause.</p>

      {!isConnected ? (
        <div
          className="form-card"
          style={{ textAlign: "center", padding: "60px 32px" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔗</div>
          <h3 style={{ marginBottom: "8px" }}>Connect Your Wallet</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Please connect your wallet to create a petition.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">
                Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your petition title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="form-hint">(optional)</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe your petition in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Image URL <span className="form-hint">(optional)</span>
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    maxHeight: "200px",
                    borderRadius: "var(--radius-md)",
                    objectFit: "cover",
                    width: "100%",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Signature Goal <span className="form-hint">(optional)</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group"
              >
                <label className="form-label">
                  Deadline <span className="form-hint">(optional)</span>
                </label>
                <input
                 style={{cursor:"pointer"}}
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
                className="toast-error"
                style={{
                  position: "static",
                  marginBottom: "16px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                }}
              >
                ⚠️{" "}
                {(error as Error).message?.slice(0, 200) ||
                  "Transaction failed"}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={isPending || isConfirming || !title.trim()}
            >
              {isPending ? (
                <>
                  <span className="loading-spinner" /> Confirming in Wallet...
                </>
              ) : isConfirming ? (
                <>
                  <span className="loading-spinner" /> Submitting On-Chain...
                </>
              ) : (
                "Create Petition"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
