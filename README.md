# VoteOnChain

On-chain governance dApp: create proposals, vote with token balance or delegated power, execute outcomes. Built with Solidity (Hardhat) and a Next.js frontend for Sepolia.

## Overview

- **Contracts:** ERC20 governance token (GOV), voting system (proposals, quorum, execution), optional target contract for execution demos.
- **Frontend:** Next.js 14 (App Router), TypeScript, wagmi, viem, RainbowKit. Connect wallet, view proposals, create/vote/execute, delegate GOV, take snapshots.

The app is configured for **Sepolia**. Contract addresses are in `frontend/lib/contracts.ts`; update them after redeploying.

## Repository structure

- `contracts/` – Solidity (VotingSystem.sol, ERC20Mock.sol including MockTargetContract)
- `scripts/deploy.js` – Deploy token, voting, and target to a network
- `frontend/` – Next.js app (dashboard, proposals, create, delegate, proposal detail with vote/execute)
- `public/` – deployment-info.json, contracts.json (written by deploy script)

## Requirements

- Node.js (e.g. 18+)
- For deployment: Hardhat env (e.g. `.env` with `SEPOLIA_RPC_URL`, `PRIVATE_KEY`)

## Contracts (Hardhat)

From the repo root:

```bash
npm install
npx hardhat compile
```

Deploy to Sepolia (requires `.env` with `SEPOLIA_RPC_URL` and `PRIVATE_KEY`):

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Output includes token, voting, and target addresses. Copy them into `frontend/lib/contracts.ts` (and optionally update `public/deployment-info.json` and `public/contracts.json` if you use them).

## Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` – from [WalletConnect Cloud](https://cloud.walletconnect.com)

Then:

```bash
npm run dev
```

Open http://localhost:3000. For production build:

```bash
npm run build
npm run start
```

## Deploying the frontend to Vercel

1. Push the repo to GitHub.
2. In Vercel, import the repository and set the **root directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (same value as in `.env.local`).
4. Deploy. Vercel runs `npm run build` in the `frontend` directory.

Contract addresses are compiled into the app via `frontend/lib/contracts.ts`. For a new deployment, update those addresses and push.

## Features

- **Dashboard:** GOV balance, min balance, quorum, mint test GOV (Sepolia), owner pause/unpause.
- **Proposals:** List with state (Pending, Active, Succeeded, etc.), open a proposal to see options and vote counts.
- **Proposal detail:** Vote (Balance, Snapshot, or Delegated; optional weight), take snapshot before voting, calculate results, execute (creator or owner), withdraw locked tokens after resolution. Creator can cancel pending proposals; owner can emergency-cancel when paused.
- **Create proposal:** Description, start delay, duration, options, optional target (MockTargetContract setValue).
- **Delegation:** Delegate GOV to another address; they vote with delegated power (consumable across proposals). Revoke returns only the unused portion to the delegator.

## Tech stack

- **Contracts:** Solidity 0.8.20, OpenZeppelin (Ownable, ReentrancyGuard, Pausable), Hardhat.
- **Frontend:** Next.js 14, TypeScript, wagmi, viem, RainbowKit, TanStack Query, Tailwind CSS, shadcn/ui (Radix), Lucide icons.

## License

MIT
