import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Voting DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false,
});

export const CONTRACTS = {
  VOTING_SYSTEM: import.meta.env.VITE_VOTING_CONTRACT || '0xA1549ACBD1464F61E6b79D9964d78Ec447aF5330',
  TOKEN: import.meta.env.VITE_TOKEN_CONTRACT || '0x945686D1A3aad6638Db7b62e68268441715f9135',
};