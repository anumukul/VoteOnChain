import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
