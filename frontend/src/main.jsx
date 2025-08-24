import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet, goerli, sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Use your .env value for WalletConnect projectId
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// List supported chains
const chains = [hardhat, goerli, sepolia, mainnet];

// Get RainbowKit connectors
const { connectors } = getDefaultWallets({
  appName: 'Voting DApp',
  projectId,
  chains,
});

// Create Wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  chains,
});

// Create a QueryClient instance (required for RainbowKit/Wagmi)
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
);