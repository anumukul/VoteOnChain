export const VOTING_SYSTEM_ABI=[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_minBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_defaultQuorum",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AlreadyVoted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DescriptionRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DuplicateOptions",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientOptions",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientTokensToCreate",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDelegation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidOption",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTimeRange",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTokenAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoTargetContract",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoTokensToWithdraw",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoVotesCast",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoWinnerDetermined",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotCancelable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalAlreadyExecuted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalNotResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalTied",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "QuorumNotMet",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "QuorumTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ResultsAlreadyCalculated",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ResultsNotCalculated",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ThresholdNotMet",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TimelockNotExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenTransferFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenWithdrawFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnauthorizedExecution",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingInProgress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingNotStarted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WeightExceedsBalance",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        }
      ],
      "name": "DelegationCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "DelegationRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "canceledBy",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "ProposalCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "createdBy",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "snapshotBlock",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "options",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timeLockDuration",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "executionDeadline",
          "type": "uint256"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "executor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "name": "ProposalExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "ProposalExpiredEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "winners",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "voteCounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "tie",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "noVotes",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "thresholdMet",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "quorumMet",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "enum VotingSystem.ProposalState",
          "name": "newState",
          "type": "uint8"
        }
      ],
      "name": "ProposalResultCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "power",
          "type": "uint256"
        }
      ],
      "name": "SnapshotTaken",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "votedOption",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum VotingSystem.VotingPowerSource",
          "name": "powerSource",
          "type": "uint8"
        }
      ],
      "name": "VoteCast",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_BATCH_SIZE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allProposals",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "address[]",
          "name": "voters",
          "type": "address[]"
        }
      ],
      "name": "batchSnapshot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "calculateResults",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "cancelProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "options",
          "type": "uint256[]"
        },
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "timeLockDuration_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "customThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "customQuorum",
          "type": "uint256"
        }
      ],
      "name": "createProposal",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "defaultExecutionWindow",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "defaultQuorum",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "defaultThreshold",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "defaultTimeLockDuration",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        }
      ],
      "name": "delegateVotingPower",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "delegationNonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "delegations",
      "outputs": [
        {
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "delegatedAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalDelegatedPower",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "emergencyCancel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "executeProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllProposals",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getDelegationInfo",
      "outputs": [
        {
          "internalType": "address",
          "name": "delegateAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "delegatedAmount",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "delegators",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "totalDelegatedPower",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "getLockedTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "getProposal",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "snapshotBlock",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "options",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "resultsCalculated",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "timeLockDuration",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "executionDeadline",
          "type": "uint256"
        },
        {
          "internalType": "enum VotingSystem.ProposalState",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "customThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "customQuorum",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "getProposalResults",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "winners",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "voteCounts",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "tie",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "noVotes",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "thresholdMet",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "quorumMet",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "calculatedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "getProposalState",
      "outputs": [
        {
          "internalType": "enum VotingSystem.ProposalState",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "getProposalVoters",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "offset",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getProposalVotersPaginated",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "voters",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "offset",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getProposalsPaginated",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "proposals_",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserProposals",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "getUserVotingPower",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "option",
          "type": "uint256"
        }
      ],
      "name": "getVoteCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "getVoterInfo",
      "outputs": [
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votedOption",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "snapshotPower",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "delegatedPower",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lastSnapshotBlock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lockedTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxProposalDuration",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minProposalDuration",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "proposalExpired",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "proposalResults",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "tie",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "noVotes",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "thresholdMet",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "quorumMet",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "calculatedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "proposalVoterCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "proposalVoters",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "proposalVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "proposals",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "snapshotBlock",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "resultsCalculated",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "timeLockDuration",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "executionDeadline",
          "type": "uint256"
        },
        {
          "internalType": "enum VotingSystem.ProposalState",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "customThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "customQuorum",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "revokeDelegation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "takeSnapshot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userProposals",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "option",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "internalType": "enum VotingSystem.VotingPowerSource",
          "name": "powerSource",
          "type": "uint8"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voterRecords",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "votes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votedOption",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "snapshotPower",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "delegatedPower",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "votingPowerSnapshot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingToken",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proposalId",
          "type": "bytes32"
        }
      ],
      "name": "withdrawLockedTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  export const ERC20_ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "initialAccount",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "initialBalance",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        }
      ],
      "name": "setBalance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        }
      ],
      "name": "setSnapshotBalance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "snapshotBalanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "takeSnapshot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];