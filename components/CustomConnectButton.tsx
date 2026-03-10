"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { base } from "wagmi/chains";
import Image from "next/image";

export function CustomConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, variables, error } = useConnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAttemptedAutoConnect = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      !isConnected &&
      !hasAttemptedAutoConnect.current &&
      connectors.length > 0
    ) {
      const farcasterConnector = connectors.find(
        (c) => c.name.toLowerCase() === "farcaster" || c.id === "farcaster",
      );
      if (farcasterConnector) {
        hasAttemptedAutoConnect.current = true;
        connect({ connector: farcasterConnector });
      }
    }
  }, [connectors, isConnected, connect]);

  if (isConnected) {
    if (chainId !== base.id) {
      return (
        <button
          onClick={() => switchChain({ chainId: base.id })}
          className="btn btn-danger btn-sm"
          style={{
            animation: "pulse-glow 2s infinite",
            background: "var(--danger)",
            color: "white",
            border: "none",
          }}
        >
          {isSwitchPending ? "Switching..." : "Switch to Base"}
        </button>
      );
    }

    return (
      <button
        onClick={() => disconnect()}
        className="flex gap-2 btn btn-secondary btn-sm"
      >
        <code className="text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </code>
        <Image src="/disconnect.svg" alt="Disconnect" width={20} height={20} />
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary btn-sm"
      >
        Connect Wallet
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-md)",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "200px",
            boxShadow: "var(--shadow-card)",
            zIndex: 100,
          }}
        >
          {connectors
            .filter((c) => "id" in c)
            .map((connector: import("wagmi").Connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                }}
                className="btn btn-secondary btn-sm wallet-option"
                style={{
                  justifyContent: "flex-start",
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.2s ease",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {connector.name === "Injected"
                  ? "Browser Wallet"
                  : connector.name}
                {isPending &&
                  // @ts-expect-error - connector runtime object has id but TS infers CreateConnectorFn
                  connector.id === variables?.connector?.id &&
                  " (connecting)"}
              </button>
            ))}
          {error && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: "0.75rem",
                padding: "8px",
                textAlign: "center",
                marginTop: "4px",
                borderTop: "1px solid var(--border-primary)",
                background: "rgba(240, 60, 60, 0.1)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              ⚠️{" "}
              {error.message.toLowerCase().includes("connector not found") ||
              error.message.toLowerCase().includes("provider not found") ||
              error.message.toLowerCase().includes("not injected")
                ? "Wallet extension not detected. Please install a wallet (e.g., MetaMask or Rabby)."
                : error.message.split("\n")[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
