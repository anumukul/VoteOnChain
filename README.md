# VotingSystem Smart Contract

A robust, secure, and extensible smart contract for on-chain governance using ERC20 tokens. Supports weighted voting, token lock, per-proposal timelock, on-chain execution, and full auditability.

---

## Features

- **Proposal Creation:**  
  - Any user with the minimum required token balance can create proposals.
  - Each proposal is uniquely identified using a hash.
  - Proposals can specify options, voting periods, target contract (for execution), calldata, and custom timelock.

- **Weighted Voting & Token Lock:**  
  - Voting power is proportional to the voter's token balance (or a chosen amount up to their balance).
  - Tokens used for voting are locked in the contract until after the voting period.

- **Result Calculation:**  
  - Anyone can calculate and record the results after voting ends.
  - Results include: winners, vote counts, total votes, quorum/threshold/tie/noVotes status.

- **On-Chain Execution:**  
  - Proposals can be executed on-chain, calling a target contract with custom calldata if they pass and after their timelock expires.

- **Immutability:**  
  - Votes cannot be changed or revoked after being cast.

- **Transparency & Auditability:**  
  - Publicly list all proposals and all voters per proposal.
  - Query individual votes, locked tokens, and proposal details.

- **Security:**  
  - Reentrancy protection on all critical functions.
  - Access control for proposal creation & contract pausing/unpausing.

- **Configurable Governance Parameters:**  
  - Owner can update minimum balance, quorum, and default timelock duration.

---

## Main Contract Interfaces

### Proposal Creation

```solidity
function createProposal(
    string memory description,
    uint256 startTime,
    uint256 endTime,
    uint256[] memory options,
    address target,
    bytes memory data,
    uint256 timeLockDuration_
) external
```

- `target`, `data`, and `timeLockDuration_` enable on-chain execution and flexible timelock per proposal.

### Voting

```solidity
function vote(bytes32 proposalId, uint256 option, uint256 weight) external
```
- Tokens are locked in the contract on vote.

### Result Calculation

```solidity
function calculateResults(bytes32 proposalId) external
```

### Proposal Execution (On-Chain)

```solidity
function executeProposal(bytes32 proposalId) external
```
- Calls the proposal's target contract with the specified data if the proposal passes.

---

## Querying Data

- **List all proposals:**  
  `getAllProposals()`
- **List all voters for a proposal:**  
  `getProposalVoters(bytes32 proposalId)`
- **Get proposal details:**  
  `getProposal(bytes32 proposalId)`
- **Get individual voter info:**  
  `getVoterInfo(bytes32 proposalId, address voter)`
- **Get proposal results:**  
  `getProposalResults(bytes32 proposalId)`
- **Get locked tokens:**  
  `getLockedTokens(bytes32 proposalId, address voter)`

---

## Events

- `ProposalCreated`
- `VoteCast`
- `ProposalResultCalculated`
- `ProposalExecuted`
- `TokensWithdrawn`

---

## Security Best Practices

- Uses OpenZeppelin's Ownable, Pausable, and ReentrancyGuard.
- No mappings inside structs for extensibility and enumeration.
- Hash-based IDs to avoid collisions.
- Comprehensive event logging for transparency.

---

## Example Usage Flow

1. **Create a proposal** with voting options, target contract, calldata, and optional timelock.
2. **Users vote** (tokens locked).
3. **Anyone calculates results** after voting ends.
4. **Proposal creator executes** proposal on-chain after timelock, if passed.
5. **Voters withdraw their locked tokens** after voting ends.

---

## Extending and Integrating

- Easily extend for delegated voting, proposal cancellation, advanced execution logic, or integration with off-chain governance tools.

---

## License

MIT

---

## Author

[anumukul](https://github.com/anumukul)