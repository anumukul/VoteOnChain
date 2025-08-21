# VotingSystem Contract with Semaphore ZK-Proof Voting

## Overview

This smart contract enables decentralized proposal creation, voting, and execution using two methods:

- **Classic ERC20 token voting**: Votes are weighted by token balance.
- **Anonymous zk-SNARK voting**: Using Semaphore, voters can cast votes anonymously, Sybil-resistant, and privacy-preserving.

It is designed for governance systems, DAOs, or any scenario where both transparent and privacy-focused voting are required.

---

## Features

- **Create Proposals**: Only the contract owner can create proposals with multiple options and a voting time window.
- **Classic Voting**: Users vote with ERC20 tokens, weighted by their balance or a provided weight.
- **ZK-Proof Voting**: Anyone with a valid Semaphore zk-SNARK proof can vote anonymously. Double voting is prevented by nullifier hashes.
- **Result Calculation**: After voting ends, anyone can view results, including winner(s), vote counts, tie status, and quorum checks.
- **Proposal Execution**: After the voting and timelock period, the proposal creator can execute the proposal.
- **Security**: Uses OpenZeppelin's Ownable for access control, and prevents double-voting via mappings.

---

## Contract Architecture

- **Semaphore Integration**: The contract imports Semaphore's verifier and checks off-chain generated zk-SNARK proofs.
- **Proposal Struct**: Each proposal tracks options, votes per option, creator, timing, and execution status.
- **Voter Struct**: Classic voting records if a user has voted, their weight, and chosen option.
- **Nullifier Hashes**: Used in ZK voting to prevent double voting.

---

## Getting Started

### Prerequisites

- Solidity ^0.8.0
- OpenZeppelin Contracts
- Semaphore Verifier contract
- ERC20 token contract
- [Hardhat](https://hardhat.org/), [Foundry](https://book.getfoundry.sh/), or [Remix IDE](https://remix.ethereum.org/)

### Installation

1. **Clone your project repo and install dependencies**:

   ```bash
   npm install @openzeppelin/contracts
   # Add Semaphore.sol to your contracts folder (get from Semaphore repo)
   ```

2. **Deploy Semaphore contract**:

   - Use the Semaphore repo: [https://github.com/semaphore-protocol/semaphore](https://github.com/semaphore-protocol/semaphore)
   - Deploy `Semaphore.sol` on your local testnet.

3. **Deploy VotingSystem contract**:
   - Pass the deployed ERC20 token address and Semaphore contract address to the constructor.

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
- **options**: Array of option IDs (e.g., candidate numbers).

### 2. Classic Voting (ERC20)

```solidity
vote(
  uint256 proposalId,
  uint256 option,
  uint256 weight
)
```

- User must have at least `minBalance` of the ERC20 token.
- Vote weight can be set or defaults to full balance.

### 3. ZK-Proof Voting (Semaphore)

```solidity
zkVote(
  uint256 proposalId,
  uint256 option,
  uint256 merkleRoot,
  uint256 nullifierHash,
  uint256 externalNullifier,
  uint256[8] calldata proof
)
```

- **merkleRoot**: Semaphore group Merkle tree root.
- **nullifierHash**: Prevents double voting.
- **externalNullifier**: Used to scope a voting session.
- **proof**: zk-SNARK proof array (generated off-chain via Semaphore).

> **Note:** Proofs must be generated off-chain using Semaphore tools. See [Semaphore Docs](https://docs.semaphore.appliedzkp.org/) and [Semaphore playground](https://semaphore.appliedzkp.org/).

### 4. View Proposal Result

```solidity
proposalResult(proposalId)
```

Returns tuple:

- `winners` (array of winning option IDs)
- `voteCounts` (votes per option)
- `totalVotes`
- `tie` (bool)
- `noVotes` (bool)
- `thresholdMet` (bool)

### 5. Execute Proposal

```solidity
executeProposal(proposalId)
```

- Only creator can execute after voting and timelock.
- Emits `ProposalExecuted`.

---

## Events

- `ProposalCreated`: Proposal is created.
- `VoteCast`: Classic vote cast.
- `VoteCastZK`: ZK vote cast.
- `ProposalResult`: Results are computed.
- `ProposalExecuted`: Proposal is executed.

---

## Example Workflow

1. **Owner** deploys ERC20 token, Semaphore, and VotingSystem contracts.
2. **Owner** creates a proposal.
3. **Voters** choose classic or ZK voting:
   - Classic: Call `vote()` with tokens.
   - ZK: Generate Semaphore proof off-chain, call `zkVote()`.
4. **Anyone** can view results after voting ends.
5. **Creator** executes proposal after timelock.

---

## Advanced/Customization Ideas

- Add group management (on-chain membership, Merkle root updates).
- Weighted ZK voting.
- Frontend for easy proposal creation, voting, and proof generation.
- Automated tests for both voting types.

---

## Security Considerations

- Ensure Semaphore contract is deployed and referenced correctly.
- Off-chain proof generation must use the correct group and external nullifier.
- Classic voting requires sufficient ERC20 token balance.
- Prevents double voting in both systems.

---

## References

- [Semaphore Protocol](https://semaphore.appliedzkp.org/)
- [Semaphore GitHub](https://github.com/semaphore-protocol/semaphore)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)

---

## License

MIT
