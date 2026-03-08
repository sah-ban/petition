"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { base } from "wagmi/chains";

export function CustomConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, variables } = useConnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <button onClick={() => disconnect()} className="btn btn-secondary btn-sm">
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
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
                  setIsOpen(false);
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
        </div>
      )}
    </div>
  );
}
