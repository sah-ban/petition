"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { formatEther, parseEventLogs } from "viem";
import {
  PETITION_ABI,
  PETITION_CONTRACT_ADDRESS,
  BASE_CHAIN_ID,
} from "@/lib/contract";
import { CustomConnectButton } from "@/components/CustomConnectButton";

export default function CreatePetitionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const { data: creationFee } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getCreationFee",
    chainId: BASE_CHAIN_ID,
  });

  const feeInEth = creationFee ? formatEther(creationFee as bigint) : "0";
  const isFree = !creationFee || (creationFee as bigint) === 0n;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [hasProcessedLogs, setHasProcessedLogs] = useState(false);

  useEffect(() => {
    if (isSuccess && receipt && !hasProcessedLogs) {
      const logs = parseEventLogs({
        abi: PETITION_ABI,
        logs: receipt.logs,
        eventName: "PetitionCreated",
      });
      if (logs.length > 0) {
        const eventArgs = logs[0].args as { petitionId: bigint };
        setCreatedId(eventArgs.petitionId.toString());
        setHasProcessedLogs(true);
      }
    }
  }, [isSuccess, receipt, hasProcessedLogs]);

  const uploadImage = async (image: File) => {
    setIsUploading(true);
    setWarning(null);
    const formData = new FormData();
    formData.append("file", image);
    try {
      const response = await fetch("/api/upload-ipfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setWarning(`Upload failed: ${errData.error || response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.IpfsHash) {
        // Use a generic public IPFS gateway or Pinata's gateway. Pinata's usually works best for pinned content.
        setImageUrl(`https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
      } else {
        setWarning("Upload failed: No IPFS hash returned");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setWarning("Error uploading image. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      if (image.type.startsWith("image/")) {
        await uploadImage(image);
      } else {
        setWarning("Invalid file type. Please upload an image or GIF.");
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          await uploadImage(file);
          break;
        }
      }
    }
  };

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
      ...(creationFee && (creationFee as bigint) > 0n
        ? { value: creationFee as bigint }
        : {}),
      chainId: BASE_CHAIN_ID,
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
            {createdId && (
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/petition/${createdId}`)}
              >
                View Petition
              </button>
            )}
            <button
              className="btn btn-secondary"
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <CustomConnectButton />
          </div>
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
                Petition Image{" "}
                <span className="form-hint">(optional - paste or upload)</span>
              </label>
              <div
                onPaste={handlePaste}
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.02)",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                className="hover-glow"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                {imageUrl ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{
                        maxHeight: "300px",
                        borderRadius: "var(--radius-sm)",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl("");
                      }}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      ×
                    </button>
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Click or paste to replace image
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: "40px 20px" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        marginBottom: "12px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                        />
                      </svg>
                    </div>
                    <p style={{ fontWeight: 500, marginBottom: "4px" }}>
                      {isUploading
                        ? "Uploading..."
                        : "Click to upload or paste image"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Supports JPG, PNG, GIF
                    </p>
                  </div>
                )}
                {isUploading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span className="loading-spinner" />
                  </div>
                )}
              </div>
              {warning && (
                <p
                  style={{
                    color: "var(--danger)",
                    fontSize: "0.85rem",
                    marginTop: "8px",
                  }}
                >
                  ⚠️ {warning}
                </p>
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

              <div className="form-group">
                <label className="form-label">
                  Deadline <span className="form-hint">(optional)</span>
                </label>
                <input
                  style={{ cursor: "pointer" }}
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

            {!isFree && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(var(--primary-rgb, 99, 102, 241), 0.1)",
                  border:
                    "1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2)",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Creation fee: <strong>{feeInEth} ETH</strong>
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
