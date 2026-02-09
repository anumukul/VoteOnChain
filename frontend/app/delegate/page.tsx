"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTRACTS } from "@/lib/contracts";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import { Users, Loader2, ArrowRight } from "lucide-react";

export default function DelegatePage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [delegateTo, setDelegateTo] = useState("");
  const [delegateAmount, setDelegateAmount] = useState("");
  const [approveAmount, setApproveAmount] = useState("");

  const { data: delegationInfo } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getDelegationInfo",
    args: address ? [address] : undefined,
  });

  const { data: delegatedPowerUsed } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "delegatedPowerUsed",
    args: address ? [address] : undefined,
  });

  const { data: nonce } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "delegationNonces",
    args: address ? [address] : undefined,
  });

  const { data: balance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.voting.address] : undefined,
  });

  const { writeContract: approveWrite, data: approveHash, isPending: approvePending } = useWriteContract();
  const { isLoading: approveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: delegateWrite, data: delegateHash, isPending: delegatePending, error: delegateError } = useWriteContract();
  const { isLoading: delegateConfirming } = useWaitForTransactionReceipt({ hash: delegateHash });

  const { writeContract: revokeWrite, data: revokeHash, isPending: revokePending } = useWriteContract();
  const { isLoading: revokeConfirming } = useWaitForTransactionReceipt({ hash: revokeHash });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["readContract"] });

  const delegateAddress = delegationInfo?.[0];
  const delegatedAmount = delegationInfo?.[1] ?? 0n;
  const delegators = delegationInfo?.[2] ?? [];
  const totalDelegatedPower = delegationInfo?.[3] ?? 0n;
  const used = delegatedPowerUsed ?? 0n;
  const availableDelegatedPower = totalDelegatedPower > used ? totalDelegatedPower - used : 0n;

  const nextNonce = nonce !== undefined ? nonce + 1n : 1n;
  const delegateAmountWei = (() => {
    try { return delegateAmount.trim() ? parseEther(delegateAmount.trim()) : 0n; } catch { return 0n; }
  })();
  const needsDelegateApproval = delegateAmountWei > 0n && allowance !== undefined && allowance < delegateAmountWei;
  const canDelegate =
    delegateTo.trim().startsWith("0x") &&
    delegateTo.trim().length === 42 &&
    delegateAmountWei > 0n &&
    balance !== undefined &&
    balance >= delegateAmountWei &&
    !needsDelegateApproval;

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Connect your wallet to manage delegation.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delegation</h1>
        <p className="text-muted-foreground mt-1">
          Delegate your GOV to another address so they can vote with your voting power. You can revoke at any time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your delegation</CardTitle>
          <CardDescription>Current delegation status and power received from others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {delegateAddress && delegateAddress !== "0x0000000000000000000000000000000000000000" ? (
            <>
              <p>
                <span className="text-muted-foreground">Delegating to:</span> {formatAddress(delegateAddress)}
              </p>
              <p>
                <span className="text-muted-foreground">Amount locked:</span> {formatTokenAmount(delegatedAmount)} GOV
              </p>
              <Button
                variant="destructive"
                size="sm"
                disabled={revokePending || revokeConfirming}
                onClick={() =>
                  revokeWrite(
                    {
                      address: CONTRACTS.voting.address,
                      abi: CONTRACTS.voting.abi,
                      functionName: "revokeDelegation",
                      gas: 200_000n,
                    },
                    { onSuccess: refetch }
                  )
                }
              >
                {(revokePending || revokeConfirming) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Revoke delegation
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">You are not delegating to anyone.</p>
          )}
          <p>
            <span className="text-muted-foreground">Power delegated to you:</span> {formatTokenAmount(totalDelegatedPower)} GOV
            {totalDelegatedPower > 0n && (
              <> · <span className="text-muted-foreground">Available to vote with:</span> {formatTokenAmount(availableDelegatedPower)} GOV</>
            )}
          </p>
          {delegators.length > 0 && (
            <p>
              <span className="text-muted-foreground">Delegators:</span> {delegators.length} address(es)
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Your GOV balance:</span> {balance !== undefined ? formatTokenAmount(balance) : "—"} GOV
          </p>
        </CardContent>
      </Card>

      {(!delegateAddress || delegateAddress === "0x0000000000000000000000000000000000000000") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delegate voting power</CardTitle>
            <CardDescription>
              Lock GOV in the voting contract and give the voting power to another address. Next nonce: {nextNonce.toString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delegate-to">Delegate to (address)</Label>
              <Input
                id="delegate-to"
                placeholder="0x..."
                value={delegateTo}
                onChange={(e) => setDelegateTo(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delegate-amount">Amount (GOV)</Label>
              <Input
                id="delegate-amount"
                type="text"
                inputMode="decimal"
                placeholder="100"
                value={delegateAmount}
                onChange={(e) => setDelegateAmount(e.target.value)}
              />
            </div>
            {needsDelegateApproval && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                <p className="text-sm font-medium">Approve GOV first</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="approve-amount">Approve amount (GOV)</Label>
                    <Input
                      id="approve-amount"
                      type="text"
                      inputMode="decimal"
                      value={approveAmount || delegateAmount}
                      onChange={(e) => setApproveAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    disabled={approvePending || approveConfirming}
                    onClick={() => {
                      const amt = parseEther((approveAmount || delegateAmount).trim() || "0");
                      if (amt === 0n) return;
                      approveWrite(
                        {
                          address: CONTRACTS.token.address,
                          abi: CONTRACTS.token.abi,
                          functionName: "approve",
                          args: [CONTRACTS.voting.address, amt],
                          gas: 100_000n,
                        },
                        { onSuccess: refetch }
                      );
                    }}
                  >
                    {(approvePending || approveConfirming) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Approve
                  </Button>
                </div>
              </div>
            )}
            <Button
              disabled={!canDelegate || delegatePending || delegateConfirming}
              onClick={() => {
                const to = delegateTo.trim() as `0x${string}`;
                delegateWrite(
                  {
                    address: CONTRACTS.voting.address,
                    abi: CONTRACTS.voting.abi,
                    functionName: "delegateVotingPower",
                    args: [to, delegateAmountWei, nextNonce],
                    gas: 300_000n,
                  },
                  { onSuccess: refetch }
                );
              }}
            >
              {(delegatePending || delegateConfirming) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delegate
            </Button>
            {delegateError && <p className="text-sm text-destructive">{delegateError.message}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
