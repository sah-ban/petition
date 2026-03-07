"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    category: "Creating & Managing Petitions",
    questions: [
      {
        q: "How do I create a petition?",
        a: (
          <ol
            style={{
              paddingLeft: "1.2rem",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <li>
              Connect your crypto wallet (MetaMask, Coinbase Wallet, etc.)
            </li>
            <li>Click &quot;Create a Petition&quot;</li>
            <li>Fill in your petition title, description, and goal</li>
            <li>Submit opengrapg your petition is recorded on-chain</li>
          </ol>
        ),
      },
      {
        q: "How much does it cost to create a petition?",
        a: "Creating a petition is currently free, but the administrator may charge a small network creation fee in the future. Note that standard blockchain gas fees will still apply for submitting the transaction on the Base network.",
      },
      {
        q: "Is there a character limit for petitions?",
        a: "Blockchain storage has costs, so petition descriptions should be concise. Detailed supporting documents can be linked externally.",
      },
      {
        q: "Where are the images stored?",
        a: "The images uploaded for petitions are stored securely on IPFS (InterPlanetary File System), a decentralized storage network. The resulting IPFS hash is then permanently referenced on the blockchain.",
      },
      {
        q: "Can a petition be modified or closed?",
        a: 'Yes. As a petition creator, you have the ability to update the title, description, image, goal, or deadline via the "My Petitions" page. You can also permanently close a petition if you no longer want it to receive new signatures.',
      },
    ],
  },
  {
    category: "Signing & Privacy",
    questions: [
      {
        q: "How do I sign a petition?",
        a: 'Simply connect your wallet, browse the Explore page, select a petition you care about, and click "Sign This Petition". Your signature is recorded permanently on-chain.',
      },
      {
        q: "Can I sign a petition more than once?",
        a: "No. Each wallet address can only sign a petition once, preventing duplicate or fake signatures.",
      },
      {
        q: "Is my identity public when I sign?",
        a: "Your wallet address is publicly visible on-chain, but your real name is not linked unless you choose to reveal it. Signatures are pseudonymous.",
      },
    ],
  },
  {
    category: "Wallet & Technical",
    questions: [
      {
        q: "What wallet do I need?",
        a: "Any wallet supported by RainbowKit, including MetaMask, Coinbase Wallet, Rainbow, WalletConnect-compatible wallets, and more.",
      },
      {
        q: "Do I need cryptocurrency to use BasePetition?",
        a: "You need a small amount of ETH on the Base network to pay gas fees. Typically less than $0.01 per transaction.",
      },
      {
        q: "How do I get ETH on Base?",
        a: "You can bridge ETH from Ethereum mainnet to Base using the Base Bridge, or buy directly on Coinbase and transfer to Base.",
      },
      {
        q: "Which blockchain does BasePetition use?",
        a: "BasePetition is built on Base, a fast, low-cost Ethereum Layer 2 network by Coinbase.",
      },
    ],
  },
  {
    category: "Trust & Transparency",
    questions: [
      {
        q: "How is this different from Change.org or other petition sites?",
        a: "Traditional petition platforms store data on private servers, signatures can be deleted, manipulated, or hidden. BasePetition records every signature on the blockchain, making them permanent and tamper-proof. No one, not even the platform, can remove or alter a signature.",
      },
      {
        q: "Can petition signatures be faked?",
        a: "No. Each signature requires a cryptographic wallet transaction, it's mathematically impossible to forge.",
      },
      {
        q: "Can the platform remove petitions or signatures?",
        a: "No. All data is stored on the blockchain. The platform has no ability to censor, remove, or alter any petition or signature.",
      },
      {
        q: "How can I verify signatures?",
        a: "All signatures are publicly verifiable on the Base blockchain explorer. Anyone can audit the contract and confirm every signature.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndexes, setOpenIndexes] = useState<Record<string, boolean>>({
    "0-0": true, // Open the first question by default
  });

  const toggleAccordion = (catIndex: number, qIndex: number) => {
    const key = `${catIndex}-${qIndex}`;
    setOpenIndexes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="form-page animate-fade-in-up" style={{ maxWidth: "800px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "16px" }}
        >
          Frequently Asked Questions
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Everything you need to know about BasePetition, on-chain signatures,
          and managing your wallet.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {faqs.map((category, catIndex) => (
          <div key={category.category}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-primary)",
                paddingBottom: "12px",
              }}
            >
              {category.category}
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {category.questions.map((item, qIndex) => {
                const isOpen = openIndexes[`${catIndex}-${qIndex}`];

                return (
                  <div
                    key={qIndex}
                    className="form-card"
                    style={{
                      padding: "0",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      borderColor: isOpen
                        ? "var(--border-hover)"
                        : "var(--border-primary)",
                      background: isOpen
                        ? "var(--bg-card-hover)"
                        : "var(--bg-card)",
                    }}
                  >
                    <button
                      onClick={() => toggleAccordion(catIndex, qIndex)}
                      style={{
                        width: "100%",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "none",
                        border: "none",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <span>{item.q}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          width: "20px",
                          height: "20px",
                          transition: "transform 0.3s ease",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          color: isOpen ? "var(--accent)" : "var(--text-muted)",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    <div
                      style={{
                        maxHeight: isOpen ? "500px" : "0",
                        opacity: isOpen ? 1 : 0,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          padding: "0 24px 24px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          fontSize: "0.95rem",
                        }}
                      >
                        {item.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "48px",
          paddingTop: "32px",
          borderTop: "1px solid var(--border-primary)",
        }}
      >
        <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
          Ready to make your voice heard permanently on-chain?
        </p>
        <Link href="/create" className="btn btn-primary">
          Create a Petition Now
        </Link>
      </div>
    </div>
  );
}
