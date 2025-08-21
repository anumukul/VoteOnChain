# VotingSystem Contract

## Overview

This smart contract enables decentralized proposal creation, voting, and execution using ERC20 token-based voting.

- **ERC20 token voting**: Votes are weighted by token balance or user-specified weight.

It is designed for governance systems, DAOs, or any scenario where transparent, token-based voting is required.

---

## Features

- **Create Proposals**: Only the contract owner can create proposals with multiple options and a voting time window.
- **Token-Based Voting**: Users vote with ERC20 tokens, weighted by their balance or a provided weight.
- **Result Calculation**: After voting ends, anyone can view results, including winner(s), vote counts, tie status, and quorum checks.
- **Proposal Execution**: After the voting and timelock period, the proposal creator can execute the proposal.
- **Security**: Uses OpenZeppelin's Ownable for access control, ReentrancyGuard for security, and prevents double-voting.
- **Admin Controls**: Pause/unpause functionality and parameter updates.

---

## Contract Architecture

- **Proposal Struct**: Each proposal tracks options, votes per option, creator, timing, and execution status.
- **Voter Struct**: Records if a user has voted, their weight, and chosen option.
- **Result Storage**: Permanent storage of calculated results for each proposal.
- **Event System**: Comprehensive logging for frontend integration.

---

## Getting Started

### Prerequisites

- Solidity ^0.8.20
- OpenZeppelin Contracts
- ERC20 token contract
- [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), or [Remix IDE](https://remix.ethereum.org/)

### Installation

1. **Clone your project repo and install dependencies**:

   ```bash
   npm install @openzeppelin/contracts
   ```

2. **Deploy ERC20 token contract**:

   - Use any standard ERC20 token

3. **Deploy VotingSystem contract**:
   - Pass the deployed ERC20 token address to the constructor.

---

## Usage

### 1. Create Proposal (Owner Only)

```solidity
createProposal(
  string description,
  uint256 startTime,
  uint256 endTime,
  uint256[] options
)
```

- **description**: Proposal summary.
- **startTime**: Unix timestamp when voting starts.
- **endTime**: Unix timestamp when voting ends.
- **options**: Array of option IDs (e.g., [1, 2, 3] for three choices).

### 2. Token-Based Voting

```solidity
vote(
  uint256 proposalId,
  uint256 option,
  uint256 weight
)
```

- User must have at least `minBalance` of the ERC20 token.
- Vote weight can be set manually or defaults to full balance.
- Weight cannot exceed user's token balance.

### 3. Calculate Results

```solidity
calculateResults(proposalId)
```

Must be called after voting ends to compute and store results.

### 4. View Proposal Results

```solidity
getProposalResults(proposalId)
```

Returns tuple:

- `winners` (array of winning option IDs)
- `voteCounts` (votes per option)
- `totalVotes`
- `tie` (bool)
- `noVotes` (bool)
- `thresholdMet` (bool - requires >50%)
- `quorumMet` (bool)

### 5. Execute Proposal

```solidity
executeProposal(proposalId)
```

- Only creator can execute after voting and timelock.
- Requires quorum met, threshold met, no tie, and votes cast.
- Emits `ProposalExecuted`.

---

## View Functions

- `getProposal(proposalId)`: Get proposal details
- `getVoteCount(proposalId, option)`: Get votes for specific option
- `getVoterInfo(proposalId, voter)`: Get voter's voting details
- `getNextProposalId()`: Get next proposal ID
- `getTotalProposals()`: Get total number of proposals

---

## Admin Functions

- `pause() / unpause()`: Emergency stop functionality
- `setQuorum(uint256)`: Update quorum requirement
- `setMinBalance(uint256)`: Update minimum token balance
- `setTimeLockDuration(uint256)`: Update execution timelock

---

## Events

- `ProposalCreated`: Proposal is created.
- `VoteCast`: Vote is cast.
- `ProposalResultCalculated`: Results are computed and stored.
- `ProposalExecuted`: Proposal is executed.

---

## Example Workflow

1. **Owner** deploys ERC20 token and VotingSystem contracts.
2. **Owner** creates a proposal with multiple options.
3. **Voters** call `vote()` with their tokens during the voting period.
4. **Anyone** calls `calculateResults()` after voting ends.
5. **Anyone** can view results using `getProposalResults()`.
6. **Creator** executes proposal after timelock period if requirements are met.

---

## Configuration Parameters

- **minBalance**: Minimum token balance required to vote
- **quorum**: Minimum total votes required for valid proposal
- **timeLockDuration**: Delay between voting end and execution (default: 60 seconds)
- **Threshold**: Winner must have >50% of total votes

---

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Access Control**: Owner-only proposal creation
- **Double Voting Prevention**: Users can only vote once per proposal
- **Input Validation**: Comprehensive parameter checking
- **Timelock**: Delay between voting and execution

---

## Testing

Run the comprehensive test suite:

```bash
npx hardhat test
```

Tests cover:

- Proposal creation and validation
- Voting mechanics and weight calculation
- Double voting prevention
- Result calculation accuracy
- Proposal execution requirements
- Admin functionality
- Security features

---

## Deployment

```bash
# Local deployment
npx hardhat run scripts/deploy.js

# Testnet deployment
npx hardhat run scripts/deploy.js --network goerli
```

---

## References

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Hardhat Documentation](https://hardhat.org/)

---

## License

MIT
