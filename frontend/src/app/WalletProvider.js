"use client";

import { WagmiConfig, createConfig, http } from "wagmi";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const chains = [sepolia];

const { wallets } = getDefaultWallets({
  appName: "Voting Dapp",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: wallets,
  chains,
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_INFURA_RPC_URL),
  },
});

export default function WalletProvider({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}