"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseEther } from "viem";
import { CONTRACTS, PROPOSAL_STATES, VOTING_POWER_SOURCE } from "@/lib/contracts";
import { formatAddress, formatTokenAmount, formatDate, getProposalDisplayState } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Vote, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

  const { data: snapshotPower } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "votingPowerSnapshot",
    args: address && id ? [id, address] : undefined,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "allowance",
    args:
      address
        ? [address, CONTRACTS.voting.address]
        : undefined,
  });

  const [selectedOption, setSelectedOption] = useState<bigint | null>(null);
  const [voteWeightInput, setVoteWeightInput] = useState("");
  const [votePowerSource, setVotePowerSource] = useState<"Balance" | "Snapshot" | "Delegated">("Balance");
  const [cancelReason, setCancelReason] = useState("");
  const [emergencyCancelReason, setEmergencyCancelReason] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

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

  const {
    writeContract: approveWrite,
    data: approveHash,
    isPending: approvePending,
  } = useWriteContract();

  const { isLoading: approveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: takeSnapshotWrite, isPending: snapshotPending } = useWriteContract();
  const { writeContract: cancelProposalWrite, isPending: cancelPending } = useWriteContract();
  const { writeContract: emergencyCancelWrite, isPending: emergencyCancelPending } = useWriteContract();
  const { writeContract: pauseWrite, isPending: pausePending } = useWriteContract();
  const { writeContract: unpauseWrite, isPending: unpausePending } = useWriteContract();

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["readContract"] });
  }, [queryClient]);

  useEffect(() => {
    if (approveHash && !approveConfirming) {
      const t = setTimeout(() => {
        refetch();
        refetchAllowance();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [approveHash, approveConfirming, refetch, refetchAllowance]);

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
  const stateNum = Number(state);
  const isActive = stateNum === 1;
  const canVote = Boolean(
    isConnected &&
    address &&
    isActive &&
    votingStarted &&
    !votingEnded &&
    voterInfo &&
    !voterInfo[0] &&
    balance !== undefined &&
    balance >= BigInt(100 * 1e18)
  );
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

  const voteWeightWei =
    voteWeightInput.trim() === ""
      ? 0n
      : (() => {
          try {
            return parseEther(voteWeightInput.trim());
          } catch {
            return 0n;
          }
        })();
  const totalDelegatedPower = delegationInfo?.[3] ?? 0n;
  const usedDelegated = delegatedPowerUsed ?? 0n;
  const availableDelegatedPower = totalDelegatedPower > usedDelegated ? totalDelegatedPower - usedDelegated : 0n;
  const voteWeightExceedsBalance =
    (votePowerSource === "Balance" && balance !== undefined && voteWeightWei > 0n && voteWeightWei > balance) ||
    (votePowerSource === "Delegated" && voteWeightWei > 0n && voteWeightWei > availableDelegatedPower) ||
    (votePowerSource === "Snapshot" && snapshotPower !== undefined && voteWeightWei > 0n && voteWeightWei > snapshotPower);
  const voteWeightInvalid = voteWeightInput.trim() !== "" && voteWeightWei === 0n;
  const noPowerForDelegated = votePowerSource === "Delegated" && availableDelegatedPower === 0n;
  const noPowerForSnapshot = votePowerSource === "Snapshot" && (snapshotPower === undefined || snapshotPower === 0n);

  const requiredAllowance =
    votePowerSource === "Delegated"
      ? 0n
      : votePowerSource === "Snapshot"
        ? (voteWeightWei > 0n ? voteWeightWei : snapshotPower ?? balance ?? 0n)
        : voteWeightWei === 0n
          ? balance ?? 0n
          : voteWeightWei;
  const needsApproval =
    canVote &&
    votePowerSource !== "Delegated" &&
    balance !== undefined &&
    allowance !== undefined &&
    requiredAllowance > 0n &&
    allowance < requiredAllowance;

  const handleApprove = () => {
    approveWrite(
      {
        address: CONTRACTS.token.address,
        abi: CONTRACTS.token.abi,
        functionName: "approve",
        args: [CONTRACTS.voting.address, requiredAllowance],
        gas: 100_000n,
      },
      { onSuccess: refetch }
    );
  };

  const powerSourceNum =
    votePowerSource === "Balance"
      ? VOTING_POWER_SOURCE.Balance
      : votePowerSource === "Snapshot"
        ? VOTING_POWER_SOURCE.Snapshot
        : VOTING_POWER_SOURCE.Delegated;
  const handleVote = () => {
    if (selectedOption === null || !id) return;
    voteWrite(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "vote",
        args: [id, selectedOption, voteWeightWei, powerSourceNum],
        gas: 1_500_000n,
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
        gas: 1_500_000n,
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
        gas: 1_500_000n,
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
        gas: 1_500_000n,
      },
      { onSuccess: refetch }
    );
  };

  const canCalculate = votingEnded && !resultsCalculated;
  const isCreatorOrOwner =
    address &&
    creator &&
    (address.toLowerCase() === creator.toLowerCase() ||
      (votingOwner && address.toLowerCase() === votingOwner.toLowerCase()));
  const canExecute =
    resultsCalculated &&
    stateNum === 3 &&
    !executed &&
    target !== "0x0000000000000000000000000000000000000000" &&
    now > Number(endTime) + Number(timeLockDuration) &&
    now <= Number(executionDeadline) &&
    Boolean(isCreatorOrOwner);
  const canWithdraw =
    (displayStateNum === 2 || displayStateNum === 5 || displayStateNum === 6 || displayStateNum === 4) &&
    lockedTokens !== undefined &&
    lockedTokens > 0n;

  const canTakeSnapshot = address && now < Number(startTime);
  const canCancelProposal =
    displayStateNum === 0 &&
    now < Number(startTime) &&
    address &&
    creator &&
    address.toLowerCase() === creator.toLowerCase();
  const canEmergencyCancel =
    Boolean(paused) &&
    address &&
    votingOwner &&
    address.toLowerCase() === votingOwner.toLowerCase();
  const isOwner = address && votingOwner && address.toLowerCase() === votingOwner.toLowerCase();

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

      {/* Take snapshot (before voting starts) */}
      {canTakeSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snapshot</CardTitle>
            <CardDescription>
              Lock in your voting power (balance + delegated to you) for this proposal. Optional; you can also vote with current balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              disabled={snapshotPending || (snapshotPower !== undefined && snapshotPower > 0n)}
              onClick={() =>
                takeSnapshotWrite(
                  {
                    address: CONTRACTS.voting.address,
                    abi: CONTRACTS.voting.abi,
                    functionName: "takeSnapshot",
                    args: [id, address!],
                    gas: 150_000n,
                  },
                  { onSuccess: refetch }
                )
              }
            >
              {snapshotPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {snapshotPower !== undefined && snapshotPower > 0n ? "Snapshot taken" : "Take snapshot for my address"}
            </Button>
            {snapshotPower !== undefined && snapshotPower > 0n && (
              <p className="text-xs text-muted-foreground mt-2">Your snapshot power: {formatTokenAmount(snapshotPower)} GOV</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vote weight (when can vote) */}
      {canVote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vote weight</CardTitle>
            <CardDescription>
              Choose power source and optional weight. Leave weight empty to use full power, or enter a fraction (e.g. 300 of 1000 delegated).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Voting power source</Label>
              <div className="flex flex-wrap gap-3">
                {(["Balance", "Snapshot", "Delegated"] as const).map((src) => (
                  <label key={src} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="powerSource"
                      checked={votePowerSource === src}
                      onChange={() => setVotePowerSource(src)}
                      className="rounded-full border-primary"
                    />
                    <span className="text-sm">
                      {src}
                      {src === "Balance" && balance !== undefined && ` (${formatTokenAmount(balance)} GOV)`}
                      {src === "Snapshot" && ` (${formatTokenAmount(snapshotPower ?? 0n)} GOV)`}
                      {src === "Delegated" && ` (${formatTokenAmount(availableDelegatedPower)} GOV available)`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {(votePowerSource === "Balance" || votePowerSource === "Delegated" || votePowerSource === "Snapshot") && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="vote-weight">Weight (GOV)</Label>
                  <Input
                    id="vote-weight"
                    type="text"
                    inputMode="decimal"
                    placeholder={
                      votePowerSource === "Balance"
                        ? "Full balance"
                        : votePowerSource === "Delegated"
                          ? "Full delegated power"
                          : "Full snapshot power"
                    }
                    value={voteWeightInput}
                    onChange={(e) => setVoteWeightInput(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <p className="text-sm text-muted-foreground shrink-0 self-end sm:self-auto">
                  Available:{" "}
                  {votePowerSource === "Balance" && (balance !== undefined ? formatTokenAmount(balance) : "—")}
                  {votePowerSource === "Delegated" && formatTokenAmount(availableDelegatedPower)}
                  {votePowerSource === "Snapshot" && (snapshotPower !== undefined ? formatTokenAmount(snapshotPower) : "—")}{" "}
                  GOV
                </p>
              </div>
            )}
            {(voteWeightExceedsBalance || voteWeightInvalid) && (
              <p className="text-xs text-destructive">
                {voteWeightExceedsBalance
                  ? "Weight cannot exceed available power for this source."
                  : "Enter a valid number (e.g. 100 or 0.5)."}
              </p>
            )}
            {noPowerForDelegated && <p className="text-xs text-destructive">No one has delegated power to you. Use Balance or Snapshot.</p>}
            {noPowerForSnapshot && votePowerSource === "Snapshot" && (
              <p className="text-xs text-amber-500">Take a snapshot first (above), or use Balance.</p>
            )}
            {needsApproval && (
              <p className="text-xs text-amber-500">Approve the voting contract to lock your GOV, then click Vote.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {needsApproval && (
          <Button
            variant="secondary"
            onClick={handleApprove}
            disabled={approvePending || approveConfirming}
          >
            {(approvePending || approveConfirming) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Approve GOV to vote
          </Button>
        )}
        {canVote && (
          <Button
            onClick={handleVote}
            disabled={
              needsApproval ||
              selectedOption === null ||
              votePending ||
              voteConfirming ||
              voteWeightExceedsBalance ||
              voteWeightInvalid ||
              noPowerForDelegated ||
              (votePowerSource === "Snapshot" && (snapshotPower === undefined || snapshotPower === 0n))
            }
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
        {canExecute && isCreatorOrOwner && (
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
        {canCancelProposal && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Reason for cancel"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="max-w-[200px]"
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={cancelPending || !cancelReason.trim()}
              onClick={() =>
                cancelProposalWrite(
                  {
                    address: CONTRACTS.voting.address,
                    abi: CONTRACTS.voting.abi,
                    functionName: "cancelProposal",
                    args: [id, cancelReason.trim()],
                    gas: 100_000n,
                  },
                  { onSuccess: refetch }
                )
              }
            >
              {cancelPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cancel proposal
            </Button>
          </div>
        )}
        {canEmergencyCancel && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Reason for emergency cancel"
              value={emergencyCancelReason}
              onChange={(e) => setEmergencyCancelReason(e.target.value)}
              className="max-w-[200px]"
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={emergencyCancelPending || !emergencyCancelReason.trim()}
              onClick={() =>
                emergencyCancelWrite(
                  {
                    address: CONTRACTS.voting.address,
                    abi: CONTRACTS.voting.abi,
                    functionName: "emergencyCancel",
                    args: [id, emergencyCancelReason.trim()],
                    gas: 100_000n,
                  },
                  { onSuccess: refetch }
                )
              }
            >
              {emergencyCancelPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Emergency cancel
            </Button>
          </div>
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
