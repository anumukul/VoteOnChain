export const CHAIN_ID = 11155111; // Sepolia

export const CONTRACTS = {
  token: {
    address: "0x53Aaaf984a3f868962CA5e625c9A6B5065c3457f" as const,
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
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
  },
  voting: {
    address: "0x1DD475b090b9955593FCD347C44c0e7c1CfC9720" as const,
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
        name: "owner",
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
      {
        inputs: [{ name: "user", type: "address" }],
        name: "getDelegationInfo",
        outputs: [
          { name: "delegateAddress", type: "address" },
          { name: "delegatedAmount", type: "uint256" },
          { name: "delegators", type: "address[]" },
          { name: "totalDelegatedPower", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "", type: "address" }],
        name: "delegationNonces",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "delegate", type: "address" }],
        name: "delegatedPowerUsed",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "", type: "bytes32" },
          { name: "", type: "address" },
        ],
        name: "votingPowerSnapshot",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "voter", type: "address" },
        ],
        name: "takeSnapshot",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "voters", type: "address[]" },
        ],
        name: "batchSnapshot",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
        name: "delegateVotingPower",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "revokeDelegation",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "reason", type: "string" },
        ],
        name: "cancelProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "proposalId", type: "bytes32" },
          { name: "reason", type: "string" },
        ],
        name: "emergencyCancel",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "paused",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
  },
  target: {
    address: "0xa481f8E21B46A5829Deb5B0a5236E416A3F8D8bf" as const,
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
