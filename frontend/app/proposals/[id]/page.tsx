"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTRACTS, PROPOSAL_STATES, VOTING_POWER_SOURCE } from "@/lib/contracts";
import { formatAddress, formatTokenAmount, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Vote, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as `0x${string}`;

  const { address, isConnected } = useAccount();
  const { data: proposal } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getProposal",
    args: [id],
  });

  const { data: results } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getProposalResults",
    args: [id],
  });

  const { data: voterInfo } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getVoterInfo",
    args: address && id ? [id, address] : undefined,
  });

  const { data: lockedTokens } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getLockedTokens",
    args: address && id ? [id, address] : undefined,
  });

  const { data: balance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const [selectedOption, setSelectedOption] = useState<bigint | null>(null);

  const {
    writeContract: voteWrite,
    data: voteHash,
    isPending: votePending,
    error: voteError,
  } = useWriteContract();

  const { isLoading: voteConfirming } = useWaitForTransactionReceipt({ hash: voteHash });
  const queryClient = useQueryClient();

  const {
    writeContract: calculateWrite,
    data: calcHash,
    isPending: calcPending,
  } = useWriteContract();

  const { isLoading: calcConfirming } = useWaitForTransactionReceipt({ hash: calcHash });

  const {
    writeContract: executeWrite,
    data: execHash,
    isPending: execPending,
  } = useWriteContract();

  const { isLoading: execConfirming } = useWaitForTransactionReceipt({ hash: execHash });

  const {
    writeContract: withdrawWrite,
    data: withdrawHash,
    isPending: withdrawPending,
  } = useWriteContract();

  const { isLoading: withdrawConfirming } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["readContract"] });
  };

  if (!proposal) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [
    proposalId,
    description,
    creator,
    startTime,
    endTime,
    snapshotBlock,
    options,
    executed,
    totalVotes,
    resultsCalculated,
    target,
    data,
    timeLockDuration,
    executionDeadline,
    state,
    customThreshold,
    customQuorum,
  ] = proposal;

  const now = Math.floor(Date.now() / 1000);
  const votingStarted = now >= Number(startTime);
  const votingEnded = now >= Number(endTime);
  const canVote = Boolean(
    isConnected &&
    address &&
    votingStarted &&
    !votingEnded &&
    voterInfo &&
    !voterInfo[0] &&
    balance !== undefined &&
    balance >= BigInt(100 * 1e18)
  );

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

  const handleVote = () => {
    if (selectedOption === null || !id) return;
    voteWrite(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "vote",
        args: [id, selectedOption, 0n, VOTING_POWER_SOURCE.Balance],
      },
      { onSuccess: refetch }
    );
  };

  const handleCalculateResults = () => {
    calculateWrite(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "calculateResults",
        args: [id],
      },
      { onSuccess: refetch }
    );
  };

  const handleExecute = () => {
    executeWrite(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "executeProposal",
        args: [id],
      },
      { onSuccess: refetch }
    );
  };

  const handleWithdraw = () => {
    withdrawWrite(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "withdrawLockedTokens",
        args: [id],
      },
      { onSuccess: refetch }
    );
  };

  const canCalculate = votingEnded && !resultsCalculated;
  const canExecute =
    resultsCalculated &&
    stateNum === 3 &&
    !executed &&
    target !== "0x0000000000000000000000000000000000000000" &&
    now > Number(endTime) + Number(timeLockDuration) &&
    now <= Number(executionDeadline);
  const canWithdraw =
    (stateNum === 2 || stateNum === 5 || stateNum === 6 || (stateNum === 3 && (executed || now > Number(executionDeadline)))) &&
    lockedTokens !== undefined &&
    lockedTokens > 0n;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Badge variant={stateVariant} className="mb-2">
            {stateLabel}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {description || "Untitled proposal"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Created by {formatAddress(creator)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Start:</span>{" "}
              {formatDate(startTime)}
            </p>
            <p>
              <span className="text-muted-foreground">End:</span>{" "}
              {formatDate(endTime)}
            </p>
            <p>
              <span className="text-muted-foreground">Total votes:</span>{" "}
              {formatTokenAmount(totalVotes)}
            </p>
            <p>
              <span className="text-muted-foreground">Options:</span>{" "}
              {options.length}
            </p>
            {resultsCalculated && results && (
              <>
                <p>
                  <span className="text-muted-foreground">Quorum met:</span>{" "}
                  {results[5] ? "Yes" : "No"}
                </p>
                <p>
                  <span className="text-muted-foreground">Threshold met:</span>{" "}
                  {results[4] ? "Yes" : "No"}
                </p>
                {results[0] && results[0].length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Winner option:</span>{" "}
                    {results[0][0].toString()}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!isConnected ? (
              <p className="text-muted-foreground">Connect wallet to see your status.</p>
            ) : voterInfo ? (
              <>
                <p>
                  <span className="text-muted-foreground">Voted:</span>{" "}
                  {voterInfo[0] ? "Yes" : "No"}
                </p>
                {voterInfo[0] && (
                  <p>
                    <span className="text-muted-foreground">Option:</span>{" "}
                    {voterInfo[2].toString()} · Weight: {formatTokenAmount(voterInfo[1])}
                  </p>
                )}
                {lockedTokens !== undefined && lockedTokens > 0n && (
                  <p>
                    <span className="text-muted-foreground">Locked:</span>{" "}
                    {formatTokenAmount(lockedTokens)} GOV
                  </p>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Options / vote counts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options & votes</CardTitle>
          <CardDescription>
            {resultsCalculated
              ? "Final results"
              : votingEnded
                ? "Voting ended — calculate results to see final counts"
                : "Current vote counts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {options.map((opt, i) => (
              <OptionRow
                key={i}
                proposalId={id}
                option={opt}
                resultVoteCount={results ? results[1]?.[i] : undefined}
                totalVotes={results ? results[2] : totalVotes}
                canVote={canVote}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canVote && (
          <Button
            onClick={handleVote}
            disabled={selectedOption === null || votePending || voteConfirming}
          >
            {(votePending || voteConfirming) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Vote className="h-4 w-4 mr-2" />
            )}
            Vote
          </Button>
        )}
        {canCalculate && (
          <Button
            variant="secondary"
            onClick={handleCalculateResults}
            disabled={calcPending || calcConfirming}
          >
            {(calcPending || calcConfirming) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Calculate results
          </Button>
        )}
        {canExecute && (
          <Button
            onClick={handleExecute}
            disabled={execPending || execConfirming}
          >
            {(execPending || execConfirming) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Execute proposal
          </Button>
        )}
        {canWithdraw && (
          <Button
            variant="outline"
            onClick={handleWithdraw}
            disabled={withdrawPending || withdrawConfirming}
          >
            {(withdrawPending || withdrawConfirming) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Withdraw locked tokens
          </Button>
        )}
      </div>

      {voteError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {voteError.message}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  proposalId,
  option,
  resultVoteCount,
  totalVotes,
  canVote,
  selectedOption,
  setSelectedOption,
}: {
  proposalId: `0x${string}`;
  option: bigint;
  resultVoteCount?: bigint;
  totalVotes: bigint;
  canVote: boolean;
  selectedOption: bigint | null;
  setSelectedOption: (v: bigint) => void;
}) {
  const { data: liveCount } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "getVoteCount",
    args: [proposalId, option],
  });
  const voteCount = resultVoteCount ?? liveCount ?? 0n;
  const total = totalVotes;
  const pct = total > 0n ? Number((voteCount * 10000n) / total) / 100 : 0;
  return (
    <li
      className={`flex items-center justify-between rounded-lg border p-3 ${
        selectedOption === option ? "border-primary bg-primary/10" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {canVote && (
          <button
            type="button"
            onClick={() => setSelectedOption(option)}
            className="h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center hover:bg-primary/20"
          >
            {selectedOption === option && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        )}
        <span className="font-medium">Option {option.toString()}</span>
      </div>
      <div className="text-right">
        <span className="font-mono text-sm">
          {formatTokenAmount(voteCount)} votes
        </span>
        {total > 0n && (
          <span className="text-muted-foreground text-sm ml-2">({pct}%)</span>
        )}
      </div>
    </li>
  );
}
