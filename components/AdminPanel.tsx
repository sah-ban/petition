"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import {
  PETITION_ABI,
  PETITION_CONTRACT_ADDRESS,
  BASE_CHAIN_ID,
} from "@/lib/contract";
import { withAttribution } from "@/lib/attribution";
import { encodeFunctionData, parseEther, parseUnits, formatEther } from "viem";

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [newFee, setNewFee] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18");

  const { data: owner } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "owner",
    chainId: BASE_CHAIN_ID,
  });

  const { data: currentFee } = useReadContract({
    address: PETITION_CONTRACT_ADDRESS,
    abi: PETITION_ABI,
    functionName: "getCreationFee",
    chainId: BASE_CHAIN_ID,
  });

  const { data: contractBalance } = useBalance({
    address: PETITION_CONTRACT_ADDRESS,
    chainId: BASE_CHAIN_ID,
  });

  const {
    sendTransaction: updateFee,
    data: updateFeeTxHash,
    isPending: isUpdatingFee,
    error: updateFeeError,
  } = useSendTransaction();

  const { isLoading: isConfirmingFee, isSuccess: isFeeSuccess } =
    useWaitForTransactionReceipt({
      hash: updateFeeTxHash,
    });

  const {
    sendTransaction: withdrawAll,
    data: withdrawTxHash,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useSendTransaction();

  const { isLoading: isConfirmingWithdraw, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawTxHash,
    });

  const {
    sendTransaction: transferOwnership,
    data: transferTxHash,
    isPending: isTransferring,
    error: transferError,
  } = useSendTransaction();

  const { isLoading: isConfirmingTransfer, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferTxHash,
    });

  const {
    sendTransaction: recoverToken,
    data: recoverTxHash,
    isPending: isRecovering,
    error: recoverError,
  } = useSendTransaction();

  const { isLoading: isConfirmingRecovery, isSuccess: isRecoverySuccess } =
    useWaitForTransactionReceipt({
      hash: recoverTxHash,
    });

  // Only render for the owner
  if (!isConnected || !owner || address !== owner) {
    return null;
  }

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee) return;

    try {
      const feeInWei = parseEther(newFee);
      updateFee({
        to: PETITION_CONTRACT_ADDRESS,
        data: withAttribution(
          encodeFunctionData({
            abi: PETITION_ABI,
            functionName: "setCreationFee",
            args: [feeInWei],
          })
        ),
        chainId: BASE_CHAIN_ID,
      });
    } catch (err) {
      console.error("Invalid fee amount", err);
    }
  };

  const handleWithdraw = () => {
    withdrawAll({
      to: PETITION_CONTRACT_ADDRESS,
      data: withAttribution(
        encodeFunctionData({
          abi: PETITION_ABI,
          functionName: "withdrawAll",
        })
      ),
      chainId: BASE_CHAIN_ID,
    });
  };

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerAddress) return;
    transferOwnership({
      to: PETITION_CONTRACT_ADDRESS,
      data: withAttribution(
        encodeFunctionData({
          abi: PETITION_ABI,
          functionName: "transferOwnership",
          args: [newOwnerAddress as `0x${string}`],
        })
      ),
      chainId: BASE_CHAIN_ID,
    });
  };

  const handleRecoverToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenAddress || !tokenAmount || !tokenDecimals) return;
    try {
      const decimals = parseInt(tokenDecimals, 10);
      const amountInUnits = parseUnits(tokenAmount, decimals);
      recoverToken({
        to: PETITION_CONTRACT_ADDRESS,
        data: withAttribution(
          encodeFunctionData({
            abi: PETITION_ABI,
            functionName: "recoverERC20",
            args: [tokenAddress as `0x${string}`, amountInUnits],
          })
        ),
        chainId: BASE_CHAIN_ID,
      });
    } catch (err) {
      console.error("Invalid token amount or decimals", err);
    }
  };

  const isContractEmpty = !contractBalance || contractBalance.value === 0n;

  return (
    <div
      className="form-card animate-fade-in-up"
      style={{
        marginBottom: "32px",
        background: "var(--card-bg)",
        border: "1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>👑</span>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Admin Panel</h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Fee Update Section */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>
            Creation Fee Config
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            Current fee:{" "}
            <strong>
              {currentFee !== undefined
                ? formatEther(currentFee as bigint)
                : "0"}{" "}
              ETH
            </strong>
          </p>

          <form onSubmit={handleUpdateFee}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                step="0.0001"
                min="0"
                className="form-input"
                placeholder="New fee in ETH (e.g. 0.01)"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                style={{ flex: 1, padding: "8px 12px" }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isUpdatingFee || isConfirmingFee || !newFee}
              >
                {isUpdatingFee || isConfirmingFee ? "⏳" : "Update"}
              </button>
            </div>
            {updateFeeError && (
              <p
                style={{
                  color: "var(--danger)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Failed to update fee
              </p>
            )}
            {isFeeSuccess && (
              <p
                style={{
                  color: "var(--success)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Fee updated! Refresh to see changes.
              </p>
            )}
          </form>
        </div>

        {/* Withdrawal Section */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>
            Contract Funds
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            Balance:{" "}
            <strong>
              {contractBalance ? formatEther(contractBalance.value) : "0"} ETH
            </strong>
          </p>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: "100%", padding: "14px 12px" }}
            onClick={handleWithdraw}
            disabled={isWithdrawing || isConfirmingWithdraw || isContractEmpty}
          >
            {isWithdrawing || isConfirmingWithdraw
              ? "Withdrawing..."
              : isContractEmpty
                ? "No Funds to Withdraw"
                : "Withdraw All to Admin"}
          </button>
          {withdrawError && (
            <p
              style={{
                color: "var(--danger)",
                fontSize: "0.8rem",
                marginTop: "8px",
              }}
            >
              Withdrawal failed
            </p>
          )}
          {isWithdrawSuccess && (
            <p
              style={{
                color: "var(--success)",
                fontSize: "0.8rem",
                marginTop: "8px",
              }}
            >
              Withdrawal successful!
            </p>
          )}
        </div>

        {/* Transfer Ownership Section */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>
            Transfer Ownership
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            Transfer admin rights to a new wallet address.
          </p>

          <form onSubmit={handleTransferOwnership}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="New Owner (0x...)"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", minWidth: "150px" }}
              />
              <button
                type="submit"
                className="btn btn-danger btn-sm"
                disabled={
                  isTransferring || isConfirmingTransfer || !newOwnerAddress
                }
              >
                {isTransferring || isConfirmingTransfer ? "⏳" : "Transfer"}
              </button>
            </div>
            {transferError && (
              <p
                style={{
                  color: "var(--danger)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Failed to transfer:{" "}
                {(transferError as Error).message.slice(0, 50)}...
              </p>
            )}
            {isTransferSuccess && (
              <p
                style={{
                  color: "var(--success)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Ownership transferred successfully!
              </p>
            )}
          </form>
        </div>

        {/* Recover ERC20 Section */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>
            Recover ERC20 Tokens
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            Rescue accidentally sent tokens. Update decimals if token isn&apos;t
            18.
          </p>

          <form onSubmit={handleRecoverToken}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Token Address (0x...)"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                style={{ padding: "8px 12px" }}
              />
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  className="form-input"
                  placeholder="Amount"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px" }}
                />
                <input
                  type="number"
                  min="0"
                  max="18"
                  className="form-input"
                  placeholder="Decimals"
                  value={tokenDecimals}
                  onChange={(e) => setTokenDecimals(e.target.value)}
                  style={{ width: "84px", padding: "8px 12px" }}
                  title="Token Decimals (default 18)"
                />
                <button
                  style={{ padding: "14px" }}
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={
                    isRecovering ||
                    isConfirmingRecovery ||
                    !tokenAddress ||
                    !tokenAmount ||
                    !tokenDecimals
                  }
                >
                  {isRecovering || isConfirmingRecovery ? "⏳" : "Recover"}
                </button>
              </div>
            </div>
            {recoverError && (
              <p
                style={{
                  color: "var(--danger)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Recovery failed: {(recoverError as Error).message.slice(0, 50)}
                ...
              </p>
            )}
            {isRecoverySuccess && (
              <p
                style={{
                  color: "var(--success)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Tokens recovered successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
