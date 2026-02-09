"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useReadContract } from "wagmi";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTRACTS, PROPOSAL_STATES, CHAIN_ID } from "@/lib/contracts";
import { formatAddress, formatTokenAmount, getProposalDisplayState } from "@/lib/utils";
import { Vote, Coins, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const [mintToAddress, setMintToAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("1000");

  const { writeContract: mintWrite, data: mintHash, isPending: mintPending, error: mintError } = useWriteContract();
  const { isLoading: mintConfirming } = useWaitForTransactionReceipt({ hash: mintHash });
  const isSepolia = chainId === CHAIN_ID;

  const { data: balance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: symbol } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "symbol",
  });

  const { data: proposalIds } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getAllProposals",
  });

  const { data: minBalance } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "minBalance",
  });

  const { data: defaultQuorum } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "defaultQuorum",
  });

  const { data: votingOwner } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "owner",
  });

  const { data: paused } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "paused",
  });

  const { writeContract: pauseWrite, isPending: pausePending } = useWriteContract();
  const { writeContract: unpauseWrite, isPending: unpausePending } = useWriteContract();

  const isVotingOwner =
    address &&
    votingOwner &&
    address.toLowerCase() === votingOwner.toLowerCase();

  const recentIds = proposalIds && proposalIds.length > 0
    ? proposalIds.slice(-5).reverse()
    : [];

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          On-chain governance
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create proposals, vote with GOV tokens, and execute actions on Sepolia. Connect your wallet to get started.
        </p>
      </section>

      {isConnected && address && (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance !== undefined
                  ? formatTokenAmount(balance)
                  : "—"}{" "}
                <span className="text-muted-foreground font-normal text-base">
                  {symbol ?? "GOV"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatAddress(address)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Min to create</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {minBalance !== undefined
                  ? formatTokenAmount(minBalance)
                  : "—"}{" "}
                <span className="text-muted-foreground font-normal text-base">
                  GOV
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Required balance to create a proposal
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Default quorum</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {defaultQuorum !== undefined
                  ? formatTokenAmount(defaultQuorum)
                  : "—"}{" "}
                <span className="text-muted-foreground font-normal text-base">
                  GOV
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum votes for proposal to pass
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {isConnected && isVotingOwner && (
        <section>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base">Contract owner</CardTitle>
              <CardDescription>
                Pause or unpause the voting contract. When paused, no one can create proposals or vote; only emergency cancel is allowed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {paused ? (
                <Button
                  variant="default"
                  onClick={() =>
                    unpauseWrite(
                      {
                        address: CONTRACTS.voting.address,
                        abi: CONTRACTS.voting.abi,
                        functionName: "unpause",
                        gas: 100_000n,
                      },
                      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readContract"] }) }
                    )
                  }
                  disabled={unpausePending}
                >
                  {unpausePending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Unpause
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() =>
                    pauseWrite(
                      {
                        address: CONTRACTS.voting.address,
                        abi: CONTRACTS.voting.abi,
                        functionName: "pause",
                        gas: 100_000n,
                      },
                      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readContract"] }) }
                    )
                  }
                  disabled={pausePending}
                >
                  {pausePending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Pause contract
                </Button>
              )}
              <span className="text-sm text-muted-foreground self-center">
                {paused ? "Contract is paused." : "Contract is active."}
              </span>
            </CardContent>
          </Card>
        </section>
      )}

      {isConnected && isSepolia && (
        <section>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Mint test GOV (testnet only)
              </CardTitle>
              <CardDescription>
                GOV is a mock token on Sepolia. Anyone can mint to any address for testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:flex sm:items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="mint-to">Recipient address</Label>
                  <Input
                    id="mint-to"
                    placeholder="0x..."
                    value={mintToAddress}
                    onChange={(e) => setMintToAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label htmlFor="mint-amount">Amount (GOV)</Label>
                  <Input
                    id="mint-amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="1000"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    try {
                      const to = mintToAddress.trim() as `0x${string}`;
                      if (!to || !to.startsWith("0x") || to.length < 42) return;
                      const amount = parseEther(mintAmount.trim() || "0");
                      if (amount === 0n) return;
                      mintWrite(
                        {
                          address: CONTRACTS.token.address,
                          abi: CONTRACTS.token.abi,
                          functionName: "mint",
                          args: [to, amount],
                          gas: 100_000n,
                        },
                        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readContract"] }) }
                      );
                    } catch {}
                  }}
                  disabled={
                    !mintToAddress.trim().startsWith("0x") ||
                    mintToAddress.trim().length < 42 ||
                    !mintAmount.trim() ||
                    mintPending ||
                    mintConfirming
                  }
                >
                  {(mintPending || mintConfirming) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Mint GOV
                </Button>
              </div>
              {mintError && <p className="text-sm text-destructive">{mintError.message}</p>}
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent proposals</h2>
          <Button asChild>
            <Link href="/proposals">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recentIds.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No proposals yet. Create the first one.
              </p>
              <Button asChild>
                <Link href="/create">Create proposal</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentIds.map((id) => (
              <ProposalCard key={id} proposalId={id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProposalCard({ proposalId }: { proposalId: `0x${string}` }) {
  const { data } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getProposal",
    args: [proposalId],
  });

  if (!data) return null;

  const [
    ,
    description,
    creator,
    startTime,
    endTime,
    ,
    options,
    executed,
    totalVotes,
    resultsCalculated,
    ,
    ,
    ,
    executionDeadline,
    state,
  ] = data;

  const stateNum = Number(state);
  const { displayStateNum, displayLabel: stateLabel } = getProposalDisplayState(
    startTime,
    endTime,
    executionDeadline,
    resultsCalculated,
    stateNum,
    Boolean(executed)
  );
  const stateVariant =
    displayStateNum === 1
      ? "warning"
      : displayStateNum === 3 || displayStateNum === 4
        ? "success"
        : displayStateNum === 2 || displayStateNum === 5 || displayStateNum === 6
          ? "destructive"
          : "secondary";

  return (
    <Link href={`/proposals/${proposalId}`}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">
              {description || "Untitled proposal"}
            </CardTitle>
            <Badge variant={stateVariant}>{stateLabel}</Badge>
          </div>
          <CardDescription>
            By {formatAddress(creator)} · {options.length} options
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Votes: {formatTokenAmount(totalVotes)}
            {resultsCalculated && executed && " · Executed"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ends {new Date(Number(endTime) * 1000).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
