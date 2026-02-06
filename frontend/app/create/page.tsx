"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTRACTS } from "@/lib/contracts";
import { formatTokenAmount } from "@/lib/utils";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_OPTIONS = [1, 2, 3];
const TARGET_ABI = [
  {
    inputs: [{ name: "_value", type: "uint256" }],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function CreateProposalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();

  const [description, setDescription] = useState("");
  const [startInHours, setStartInHours] = useState("1");
  const [durationDays, setDurationDays] = useState("3");
  const [options, setOptions] = useState<number[]>(DEFAULT_OPTIONS);
  const [targetValue, setTargetValue] = useState("");
  const [useTarget, setUseTarget] = useState(false);

  const { data: balance } = useReadContract({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: minBalance } = useReadContract({
    address: CONTRACTS.voting.address,
    abi: CONTRACTS.voting.abi,
    functionName: "minBalance",
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const canCreate =
    isConnected &&
    balance !== undefined &&
    minBalance !== undefined &&
    balance >= minBalance &&
    description.trim().length > 0 &&
    options.length >= 2 &&
    Number(startInHours) >= 0 &&
    Number(durationDays) >= 1;

  const addOption = () => {
    const next = options.length > 0 ? Math.max(...options) + 1 : 1;
    setOptions([...options, next]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const submit = () => {
    if (!canCreate || !address) return;

    const now = Math.floor(Date.now() / 1000);
    const startTime = now + Number(startInHours) * 3600;
    const endTime = startTime + Number(durationDays) * 86400;

    const target = useTarget && targetValue ? CONTRACTS.target.address : "0x0000000000000000000000000000000000000000";
    const data =
      useTarget && targetValue
        ? encodeFunctionData({
            abi: TARGET_ABI,
            functionName: "setValue",
            args: [BigInt(targetValue)],
          })
        : "0x" as `0x${string}`;

    writeContract(
      {
        address: CONTRACTS.voting.address,
        abi: CONTRACTS.voting.abi,
        functionName: "createProposal",
        args: [
          description.trim(),
          BigInt(startTime),
          BigInt(endTime),
          options.map((o) => BigInt(o)),
          target as `0x${string}`,
          data,
          0n,
          0n,
          0n,
        ],
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["readContract"] });
          router.push("/proposals");
        },
      }
    );
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <PlusCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">Connect your wallet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            You need to connect a wallet with GOV tokens to create a proposal.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasEnoughBalance = balance !== undefined && minBalance !== undefined && balance >= minBalance;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create proposal</h1>
        <p className="text-muted-foreground mt-1">
          Submit a new governance proposal. You need at least{" "}
          {minBalance !== undefined ? formatTokenAmount(minBalance) : "—"} GOV to create.
        </p>
        {balance !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">
            Your balance: {formatTokenAmount(balance)} GOV
            {!hasEnoughBalance && (
              <span className="text-destructive ml-2">(insufficient)</span>
            )}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal details</CardTitle>
          <CardDescription>
            Describe the proposal and set voting options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this proposal about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Voting starts in (hours)</Label>
              <Input
                id="start"
                type="number"
                min={0}
                value={startInHours}
                onChange={(e) => setStartInHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={30}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options (min 2)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <ul className="space-y-2">
              {options.map((opt, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-8 text-muted-foreground font-mono text-sm">
                    {opt}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= 2}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTarget"
                checked={useTarget}
                onChange={(e) => setUseTarget(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="useTarget">Execute on MockTargetContract (setValue)</Label>
            </div>
            {useTarget && (
              <div className="space-y-2">
                <Label htmlFor="targetValue">Value to set (uint256)</Label>
                <Input
                  id="targetValue"
                  type="number"
                  min={0}
                  placeholder="e.g. 42"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button
            onClick={submit}
            disabled={!canCreate || isPending || confirming}
            className="w-full"
          >
            {(isPending || confirming) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Create proposal
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
