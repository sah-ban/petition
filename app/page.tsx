"use client";

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

function PetitionLoader({ petitionId }: { petitionId: number }) {
  const { data: petition } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getPetition",
    args: [BigInt(petitionId)],
    chainId: BASE_CHAIN_ID,
  });

  if (!petition) {
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

  return <PetitionCard petition={petition as unknown as Petition} />;
}

export default function HomePage() {
  const { data: totalPetitions, isLoading } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getTotalPetitions",
    chainId: BASE_CHAIN_ID,
  });

  const total = totalPetitions ? Number(totalPetitions) : 0;
  const petitionIds = Array.from({ length: total }, (_, i) => total - 1 - i);

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="card-content">
                  <div
                    className="skeleton"
                    style={{ height: "180px", marginBottom: "16px" }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      height: "24px",
                      width: "70%",
                      marginBottom: "8px",
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: "16px", width: "100%" }}
                  />
                </div>
              </div>
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
          <div className="petition-grid">
            {petitionIds.map((id) => (
              <PetitionLoader key={id} petitionId={id} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
