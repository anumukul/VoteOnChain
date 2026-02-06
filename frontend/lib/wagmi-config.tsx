"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const config = getDefaultConfig({
  appName: "VoteOnChain",
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});
