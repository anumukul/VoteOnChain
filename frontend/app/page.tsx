"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTRACTS, PROPOSAL_STATES } from "@/lib/contracts";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import { Vote, Coins, FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useAccount();

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
    ,
    state,
  ] = data;

  const stateNum = Number(state);
  const stateLabel = PROPOSAL_STATES[stateNum] ?? "Unknown";
  const stateVariant =
    stateNum === 1
      ? "warning"
      : stateNum === 3 || stateNum === 4
        ? "success"
        : stateNum === 2 || stateNum === 5 || stateNum === 6
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
