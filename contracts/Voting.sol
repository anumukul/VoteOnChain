// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Semaphore.sol";

contract VotingSystem is Ownable {
    Semaphore public semaphore;
    struct Proposal {
        uint256 id;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256[] options;
        bool executed;
        mapping(uint256 => uint256) votes;
    }

    IERC20 public votingToken;
    uint256 public minBalance;
    uint256 public quorum;

    uint256 public timeLockDuration = 60;

    mapping(uint256 => bool) public nullifierHashes;

    constructor(
        address _token,
        uint256 _minBalance,
        uint256 _quorum,
        address semaphoreAddress
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        votingToken = IERC20(_token);
        minBalance = _minBalance;
        quorum = _quorum;
        semaphore = Semaphore(semaphoreAddress);
    }

    struct Voter {
        bool hasVoted;
        uint256 weight;
        uint256 votedOption;
    }

    uint256 private nextProposalId = 1;

    mapping(uint256 => Proposal) proposals;
    mapping(uint256 => mapping(address => Voter)) public votes;
    mapping(address => uint256) public voterRecords;

    event ProposalCreated(
        uint256 indexed id,
        string description,
        address indexed createdBy,
        uint256 startTime,
        uint256 endTime,
        uint256[] options
    );

    event VoteCast(
        uint256 indexed id,
        address indexed voter,
        uint256 weight,
        uint256 votedOption
    );

    event VoteCastZK(
        uint256 indexed id,
        uint256 nullifierHash,
        uint256 votedOption
    );

    event ProposalResult(
        uint256 indexed proposalId,
        uint256[] winners,
        uint256[] voteCounts,
        uint256 totalVotes,
        bool tie,
        bool noVotes,
        bool thresholdMet
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        bool success
    );

    function createProposal(
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options
    ) external onlyOwner {
        require(bytes(description).length > 0, "Description is required");
        require(
            startTime > block.timestamp,
            "Start Time should be in the future"
        );
        require(endTime > startTime, "End time should be after Start Time");
        require(
            options.length >= 2,
            "At least two options required for voting"
        );

        uint256 proposalId = nextProposalId++;

        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.description = description;
        p.creator = msg.sender;
        p.startTime = startTime;
        p.endTime = endTime;
        p.executed = false;

        for (uint i = 0; i < options.length; i++) {
            p.options.push(options[i]);
            p.votes[options[i]] = 0;
        }

        emit ProposalCreated(
            proposalId,
            description,
            msg.sender,
            startTime,
            endTime,
            options
        );
    }

    function isValidOption(
        Proposal storage p,
        uint256 option
    ) internal view returns (bool) {
        for (uint i = 0; i < p.options.length; i++) {
            if (p.options[i] == option) {
                return true;
            }
        }
        return false;
    }

    function vote(uint proposalId, uint option, uint weight) external {
        Proposal storage p = proposals[proposalId];

        require(p.startTime > 0, "Proposal does not exist");
        require(p.startTime <= block.timestamp, "Voting not started yet");
        require(p.endTime > block.timestamp, "Voting period has ended");
        require(isValidOption(p, option), "Invalid option");

        Voter storage v = votes[proposalId][msg.sender];

        require(!v.hasVoted, "Already voted");

        uint256 voterBalance = votingToken.balanceOf(msg.sender);

        require(voterBalance >= minBalance, "Not enough balance");

        if (weight > 0) {
            require(weight <= voterBalance, "Weight exceeds token balance");
        }

        uint256 voteWeight = weight;
        if (voteWeight == 0) {
            voteWeight = voterBalance;
        } else {
            voteWeight = weight * weight;
        }

        p.votes[option] += voteWeight;
        v.hasVoted = true;
        v.weight = voteWeight;
        v.votedOption = option;
        voterRecords[msg.sender] += 1;

        emit VoteCast(proposalId, msg.sender, voteWeight, option);
    }

    // --- Semaphore ZKP Voting Function ---
    function zkVote(
        uint256 proposalId,
        uint256 option,
        uint256 merkleRoot,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external {
        Proposal storage p = proposals[proposalId];

        require(p.startTime > 0, "Proposal does not exist");
        require(p.startTime <= block.timestamp, "Voting not started yet");
        require(p.endTime > block.timestamp, "Voting period has ended");
        require(isValidOption(p, option), "Invalid option");

        require(
            !nullifierHashes[nullifierHash],
            "Already voted with ZK proof!"
        );

        // Verify Semaphore ZKP
        semaphore.verifyProof(
            merkleRoot,
            nullifierHash,
            option,
            externalNullifier,
            proof
        );

        // Mark nullifier as used
        nullifierHashes[nullifierHash] = true;

        // Count vote (1 vote per valid ZK proof)
        p.votes[option] += 1;

        emit VoteCastZK(proposalId, nullifierHash, option);
    }

    // --------------------------------------

    function proposalResult(
        uint256 proposalId
    )
        public
        view
        returns (
            uint256[] memory winners,
            uint256[] memory voteCounts,
            uint256 totalVotes,
            bool tie,
            bool noVotes,
            bool thresholdMet
        )
    {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp > p.endTime, "Voting in progress");

        uint256 optionCount = p.options.length;
        voteCounts = new uint256[](optionCount);
        totalVotes = 0;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < optionCount; i++) {
            uint256 count = p.votes[p.options[i]];
            voteCounts[i] = count;
            totalVotes += count;
            if (count > maxVotes) {
                maxVotes = count;
            }
        }

        if (totalVotes == 0) {
            noVotes = true;
            tie = false;
            winners = new uint256[](0);
            thresholdMet = false;
            return (
                winners,
                voteCounts,
                totalVotes,
                tie,
                noVotes,
                thresholdMet
            );
        }

        require(totalVotes >= quorum, "invalid proposal");

        uint256 tieCount = 0;
        for (uint256 i = 0; i < optionCount; i++) {
            if (voteCounts[i] == maxVotes) {
                tieCount++;
            }
        }

        winners = new uint256[](tieCount);
        uint256 wIdx = 0;
        for (uint256 i = 0; i < optionCount; i++) {
            if (voteCounts[i] == maxVotes) {
                winners[wIdx] = p.options[i];
                wIdx++;
            }
        }

        tie = (tieCount > 1);

        thresholdMet = ((maxVotes * 100) / totalVotes > 50);

        if (tie || !thresholdMet) {
            winners = new uint256[](0);
        }

        return (winners, voteCounts, totalVotes, tie, noVotes, thresholdMet);
    }

    function executeProposal(uint proposalId) external {
        require(msg.sender == proposals[proposalId].creator, "Not allowed");
        Proposal storage p = proposals[proposalId];
        require(p.startTime > 0, "Proposal does not exist");

        require(!p.executed, "Proposal has been already executed");
        require(
            block.timestamp > p.endTime,
            "Proposal voting period not ended yet"
        );

        require(
            block.timestamp > p.endTime + timeLockDuration,
            "Time lock duration not ended yet"
        );

        (
            uint256[] memory winners,
            uint256[] memory voteCounts,
            uint256 totalVotes,
            bool tie,
            bool noVotes,
            bool thresholdMet
        ) = proposalResult(proposalId);

        require(totalVotes >= quorum, "Not a valid proposal");
        require(thresholdMet, "Threshold not met");
        require(!tie, "Proposal tied");
        require(!noVotes, "No votes cast");
        require(winners.length > 0, "No winner");

        proposals[proposalId].executed = true;

        emit ProposalExecuted(proposalId, msg.sender, true);
    }
}
