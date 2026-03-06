"use client";

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

export default function PetitionCard({ petition }: { petition: Petition }) {
  const isActive = petition.status === 0;
  const isExpired =
    petition.deadline > 0n &&
    BigInt(Math.floor(Date.now() / 1000)) > petition.deadline;

  const progress =
    petition.targetGoal > 0n
      ? Number((petition.signatureCount * 100n) / petition.targetGoal)
      : 0;

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return null;
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const createdDate = formatDate(petition.createdAt);
  const deadlineDate = formatDate(petition.deadline);

  return (
    <Link
      href={`/petition/${petition.id.toString()}`}
      style={{ textDecoration: "none" }}
    >
      <div className="card animate-fade-in">
        <div className="card-content">
          {petition.imageUrl && (
            <img
              src={petition.imageUrl}
              alt={petition.title}
              className="card-image"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              className={`badge ${
                !isActive
                  ? "badge-closed"
                  : isExpired
                    ? "badge-expired"
                    : "badge-active"
              }`}
            >
              {!isActive ? "Closed" : isExpired ? "Expired" : "Active"}
            </span>
            {createdDate && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {createdDate}
              </span>
            )}
          </div>

          <h3 className="card-title">{petition.title}</h3>

          {petition.description && (
            <p className="card-description">{petition.description}</p>
          )}

          {petition.targetGoal > 0n && (
            <>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="progress-text">
                <span>{petition.signatureCount.toString()} signatures</span>
                <span>Goal: {petition.targetGoal.toString()}</span>
              </div>
            </>
          )}

          <div className="card-footer" style={{ marginTop: "12px" }}>
            <div className="card-meta">
              <div className="card-meta-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {petition.signatureCount.toString()} signed
              </div>
              {deadlineDate && (
                <div className="card-meta-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {deadlineDate}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
