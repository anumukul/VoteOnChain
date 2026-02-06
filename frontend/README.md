# VoteOnChain Frontend

Modern Next.js frontend for the VoteOnChain governance dApp. Built with **Next.js**, **TypeScript**, **wagmi**, **viem**, **RainbowKit**, and **shadcn/ui**.

## Features

- **Dashboard** — GOV balance, min balance, quorum, and recent proposals
- **Proposals** — List all proposals with state badges
- **Proposal detail** — View options, vote counts, vote, calculate results, execute, withdraw locked tokens
- **Create proposal** — Submit new proposals with optional target execution (MockTargetContract.setValue)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

   Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com).

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Contract addresses

The app uses the deployed Sepolia addresses from the repo root:

- **Token (GOV):** `0xe1267DBA9e3E3749aAF1eFfbC3C4D409f4CbF7Bf`
- **VotingSystem:** `0xF51F3bD4C08b510e704058694AD59B690784055F`
- **MockTargetContract:** `0xC799F442F85D4d28DA377342F30C39041b9c102A`

To point to different deployments, update `frontend/lib/contracts.ts`.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **wagmi** + **viem** — contract reads/writes
- **RainbowKit** — wallet connect (Sepolia)
- **@tanstack/react-query** — caching (used by wagmi)
- **Tailwind CSS** + **shadcn/ui** (Radix) — components
- **Lucide** — icons

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
