"use client";

import { WagmiConfig, createConfig, http } from "wagmi";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";

const chains = [sepolia];

const { connectors } = getDefaultWallets({
  appName: "Voting Dapp",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  chains,
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_INFURA_RPC_URL),
  },
});

// Create a query client instance
const queryClient = new QueryClient();

export default function WalletProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}