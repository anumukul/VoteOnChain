"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACTS, PROPOSAL_STATES } from "@/lib/contracts";
import { formatAddress, formatTokenAmount, getProposalDisplayState } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function ProposalsPage() {
  const { data: proposalIds } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getAllProposals",
  });

  const ids = proposalIds ?? [];
  const reversed = [...ids].reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
        <p className="text-muted-foreground mt-1">
          Browse and vote on governance proposals.
        </p>
      </div>

      {reversed.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No proposals yet</p>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Create the first proposal to start on-chain governance.
            </p>
            <Link
              href="/create"
              className="text-primary font-medium hover:underline"
            >
              Create proposal →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {reversed.map((id) => (
            <li key={id}>
              <ProposalRow proposalId={id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProposalRow({ proposalId }: { proposalId: `0x${string}` }) {
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
    timeLockDuration,
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
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium line-clamp-2">{description || "Untitled"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              By {formatAddress(creator)} · {options.length} options ·{" "}
              {formatTokenAmount(totalVotes)} votes
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ends {new Date(Number(endTime) * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={stateVariant}>{stateLabel}</Badge>
            {executed && (
              <Badge variant="outline">Executed</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
