export const CHAIN_ID = 11155111; // Sepolia

export const CONTRACTS = {
  token: {
    address: "0xe1267DBA9e3E3749aAF1eFfbC3C4D409f4CbF7Bf" as const,
    abi: [
      {
        inputs: [
          { name: "account", type: "address" },
        ],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
  },
  voting: {
    address: "0xF51F3bD4C08b510e704058694AD59B690784055F" as const,
    abi: [
      {
        inputs: [],
        name: "minBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "defaultQuorum",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "votingToken",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getAllProposals",
        outputs: [{ name: "", type: "bytes32[]" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "offset", type: "uint256" },
          { name: "limit", type: "uint256" },
        ],
        name: "getProposalsPaginated",
        outputs: [{ name: "proposals_", type: "bytes32[]" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "proposalId", type: "bytes32" }],
        name: "getProposal",
        outputs: [
          { name: "id", type: "bytes32" },
          { name: "description", type: "string" },
          { name: "creator", type: "address" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "snapshotBlock", type: "uint256" },
          { name: "options", type: "uint256[]" },
          { name: "executed", type: "bool" },
          { name: "totalVotes", type: "uint256" },
          { name: "resultsCalculated", type: "bool" },
          { name: "target", type: "address" },
          { name: "data", type: "bytes" },
          { name: "timeLockDuration", type: "uint256" },
          { name: "executionDeadline", type: "uint256" },
          { name: "state", type: "uint8" },
          { name: "customThreshold", type: "uint256" },
          { name: "customQuorum", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "proposalId", type: "bytes32" }],
        name: "getProposalResults",
        outputs: [
          { name: "winners", type: "uint256[]" },
          { name: "voteCounts", type: "uint256[]" },
          { name: "totalVotes", type: "uint256" },
          { name: "tie", type: "bool" },
          { name: "noVotes", type: "bool" },
          { name: "thresholdMet", type: "bool" },
          { name: "quorumMet", type: "bool" },
          { name: "calculatedAt", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "option", type: "uint256" },
        ],
        name: "getVoteCount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "voter", type: "address" },
        ],
        name: "getVoterInfo",
        outputs: [
          { name: "hasVoted", type: "bool" },
          { name: "weight", type: "uint256" },
          { name: "votedOption", type: "uint256" },
          { name: "snapshotPower", type: "uint256" },
          { name: "delegatedPower", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "voter", type: "address" },
        ],
        name: "getLockedTokens",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "description", type: "string" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "options", type: "uint256[]" },
          { name: "target", type: "address" },
          { name: "data", type: "bytes" },
          { name: "timeLockDuration_", type: "uint256" },
          { name: "customThreshold", type: "uint256" },
          { name: "customQuorum", type: "uint256" },
        ],
        name: "createProposal",
        outputs: [{ name: "", type: "bytes32" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "option", type: "uint256" },
          { name: "weight", type: "uint256" },
          { name: "powerSource", type: "uint8" },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ name: "proposalId", type: "bytes32" }],
        name: "calculateResults",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ name: "proposalId", type: "bytes32" }],
        name: "executeProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ name: "proposalId", type: "bytes32" }],
        name: "withdrawLockedTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
  },
  target: {
    address: "0xC799F442F85D4d28DA377342F30C39041b9c102A" as const,
  },
} as const;

export type ProposalState =
  | "Pending"
  | "Active"
  | "Defeated"
  | "Succeeded"
  | "Executed"
  | "Canceled"
  | "Expired";

export const PROPOSAL_STATES: ProposalState[] = [
  "Pending",
  "Active",
  "Defeated",
  "Succeeded",
  "Executed",
  "Canceled",
  "Expired",
];

export const VOTING_POWER_SOURCE = {
  Balance: 0,
  Snapshot: 1,
  Delegated: 2,
} as const;
