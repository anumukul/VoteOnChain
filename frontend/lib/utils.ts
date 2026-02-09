import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PROPOSAL_STATES } from "./contracts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(wei: bigint, decimals = 18): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = wei / divisor;
  const frac = wei % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4).replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Derive display state from proposal data so status updates automatically (no need to call calculateResults for UI). */
export function getProposalDisplayState(
  startTime: bigint,
  endTime: bigint,
  executionDeadline: bigint,
  resultsCalculated: boolean,
  state: number,
  executed: boolean
): { displayStateNum: number; displayLabel: string } {
  const now = Math.floor(Date.now() / 1000);
  const start = Number(startTime);
  const end = Number(endTime);
  const deadline = Number(executionDeadline);

  if (executed) return { displayStateNum: 4, displayLabel: PROPOSAL_STATES[4]! };
  if (state === 5) return { displayStateNum: 5, displayLabel: PROPOSAL_STATES[5]! };
  if (state === 0 && now < start) return { displayStateNum: 0, displayLabel: PROPOSAL_STATES[0]! };
  if (state === 0 && now >= start) return { displayStateNum: 1, displayLabel: PROPOSAL_STATES[1]! };
  if (state === 1 && now >= end && !resultsCalculated)
    return { displayStateNum: 1, displayLabel: "Voting ended" };
  if (state === 1) return { displayStateNum: 1, displayLabel: PROPOSAL_STATES[1]! };
  if (state === 3 && now > deadline) return { displayStateNum: 6, displayLabel: PROPOSAL_STATES[6]! };
  return { displayStateNum: state, displayLabel: PROPOSAL_STATES[state] ?? "Unknown" };
}
