"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import {
  PETITION_ABI,
  PETITION_CONTRACT_ADDRESS,
  BASE_CHAIN_ID,
} from "@/lib/contract";
import PetitionCard from "@/components/PetitionCard";
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

function PetitionLoader() {
  return (
    <div className="card">
      <div className="card-content">
        <div
          className="skeleton"
          style={{ height: "180px", marginBottom: "16px" }}
        />
        <div
          className="skeleton"
          style={{ height: "24px", width: "70%", marginBottom: "8px" }}
        />
        <div
          className="skeleton"
          style={{ height: "16px", width: "100%", marginBottom: "4px" }}
        />
        <div className="skeleton" style={{ height: "16px", width: "60%" }} />
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: totalPetitionsData, isLoading: isTotalLoading } =
    useReadContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "getTotalPetitions",
      chainId: BASE_CHAIN_ID,
    });

  const total = totalPetitionsData ? Number(totalPetitionsData) : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Calculate the bounds for retrieving the newest items.
  // We want page 1 to be the *last* PAGE_SIZE items in the array.
  const offset = Math.max(0, total - currentPage * PAGE_SIZE);
  const limit = Math.min(PAGE_SIZE, total - (currentPage - 1) * PAGE_SIZE);

  const { data: paginatedPetitions, isLoading: isPetitionsLoading } =
    useReadContract({
      address: PETITION_CONTRACT_ADDRESS,
      abi: PETITION_ABI,
      functionName: "getPetitionsPaginated",
      args: [BigInt(offset), BigInt(limit)],
      chainId: BASE_CHAIN_ID,
      query: {
        enabled: total > 0,
      },
    });

  // Reverse the fetched array to maintain newest-first order within the page.
  const petitionsToDisplay = paginatedPetitions
    ? [...(paginatedPetitions as Petition[])].reverse()
    : [];

  const isLoading = isTotalLoading || isPetitionsLoading;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container animate-fade-in-up">
          <h1>Petitions On-Chain</h1>
          <p>
            A decentralized petition platform built on Base. <br />
            Create and sign petitions where every signature is transparent,
            immutable, and verifiable.
          </p>
          <Link href="/create" className="btn btn-primary btn-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create a Petition
          </Link>
        </div>
      </section>

      {/* Petitions Grid */}
      <section className="container" style={{ paddingTop: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>All Petitions</h2>
        </div>

        {isLoading ? (
          <div className="petition-grid">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <PetitionLoader key={`loader-${i}`} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No petitions yet</h3>
            <p>
              Be the first to create a petition and make your voice heard
              on-chain!
            </p>
            <Link href="/create" className="btn btn-primary">
              Create First Petition
            </Link>
          </div>
        ) : (
          <>
            <div className="petition-grid">
              {petitionsToDisplay.map((petition) => (
                <PetitionCard
                  key={petition.id.toString()}
                  petition={petition}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "40px",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
