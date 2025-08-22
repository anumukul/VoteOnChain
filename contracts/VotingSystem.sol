// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VotingSystem is Ownable, ReentrancyGuard, Pausable {
    struct Proposal {
        bytes32 id;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256[] options;
        bool executed;
        uint256 totalVotes;
        bool resultsCalculated;
    }

    struct ProposalResults {
        uint256[] winners;
        uint256[] voteCounts;
        uint256 totalVotes;
        bool tie;
        bool noVotes;
        bool thresholdMet;
        bool quorumMet;
    }

    struct Voter {
        bool hasVoted;
        uint256 weight;
        uint256 votedOption;
    }

    IERC20 public votingToken;
    uint256 public minBalance;
    uint256 public quorum;
    uint256 public timeLockDuration = 60;

    mapping(bytes32 => Proposal) proposals;
    mapping(bytes32 => mapping(address => Voter)) public votes;
    mapping(bytes32 => ProposalResults) public proposalResults;
    mapping(address => uint256) public voterRecords;
    mapping(bytes32 => mapping(uint256 => uint256)) public proposalVotes; // proposalId => optionId => votes
    mapping(bytes32 => mapping(address => uint256)) public lockedTokens; // proposalId => voter => amount

    event ProposalCreated(
        bytes32 indexed id,
        string description,
        address indexed createdBy,
        uint256 startTime,
        uint256 endTime,
        uint256[] options
    );

    event VoteCast(
        bytes32 indexed id,
        address indexed voter,
        uint256 weight,
        uint256 votedOption
    );

    event ProposalResultCalculated(
        bytes32 indexed proposalId,
        uint256[] winners,
        uint256[] voteCounts,
        uint256 totalVotes,
        bool tie,
        bool noVotes,
        bool thresholdMet,
        bool quorumMet
    );

    event ProposalExecuted(
        bytes32 indexed proposalId,
        address indexed executor,
        bool success
    );

    event TokensWithdrawn(
        bytes32 indexed proposalId,
        address indexed voter,
        uint256 amount
    );

    constructor(
        address _token,
        uint256 _minBalance,
        uint256 _quorum
    ) Ownable() {
        require(_token != address(0), "Invalid token address");
        require(_quorum > 0, "Quorum must be greater than 0");

        votingToken = IERC20(_token);
        minBalance = _minBalance;
        quorum = _quorum;
    }

    function createProposal(
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options
    ) external {
        require(bytes(description).length > 0, "Description is required");
        require(
            startTime > block.timestamp,
            "Start time must be in the future"
        );
        require(endTime > startTime, "End time must be after start time");
        require(options.length >= 2, "At least two options required");

        for (uint i = 0; i < options.length; i++) {
            for (uint j = i + 1; j < options.length; j++) {
                require(
                    options[i] != options[j],
                    "Duplicate options not allowed"
                );
            }
        }

        // Hash-based unique proposal id
        bytes32 proposalId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, description, options)
        );

        require(
            proposals[proposalId].startTime == 0,
            "Proposal already exists"
        );

        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.description = description;
        p.creator = msg.sender;
        p.startTime = startTime;
        p.endTime = endTime;
        p.executed = false;
        p.totalVotes = 0;
        p.resultsCalculated = false;

        for (uint i = 0; i < options.length; i++) {
            p.options.push(options[i]);
            proposalVotes[proposalId][options[i]] = 0; // Initialize vote count for each option
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

    function vote(
        bytes32 proposalId,
        uint256 option,
        uint256 weight
    ) external nonReentrant whenNotPaused {
        Proposal storage p = proposals[proposalId];

        require(p.startTime > 0, "Proposal does not exist");
        require(block.timestamp >= p.startTime, "Voting not started yet");
        require(block.timestamp < p.endTime, "Voting period has ended");
        require(isValidOption(p, option), "Invalid option");

        Voter storage v = votes[proposalId][msg.sender];
        require(!v.hasVoted, "Already voted");

        uint256 voterBalance = votingToken.balanceOf(msg.sender);
        require(voterBalance >= minBalance, "Insufficient token balance");

        uint256 voteWeight;
        if (weight > 0) {
            require(weight <= voterBalance, "Weight exceeds token balance");
            voteWeight = weight;
        } else {
            voteWeight = voterBalance;
        }

        require(
            votingToken.transferFrom(msg.sender, address(this), voteWeight),
            "Token transfer failed"
        );
        lockedTokens[proposalId][msg.sender] = voteWeight;

        proposalVotes[proposalId][option] += voteWeight;
        p.totalVotes += voteWeight;
        v.hasVoted = true;
        v.weight = voteWeight;
        v.votedOption = option;
        voterRecords[msg.sender] += 1;

        emit VoteCast(proposalId, msg.sender, voteWeight, option);
    }

    function withdrawLockedTokens(bytes32 proposalId) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(p.startTime > 0, "Proposal does not exist");
        require(block.timestamp > p.endTime, "Voting period not ended");

        uint256 amount = lockedTokens[proposalId][msg.sender];
        require(amount > 0, "No tokens to withdraw");

        lockedTokens[proposalId][msg.sender] = 0;
        require(
            votingToken.transfer(msg.sender, amount),
            "Token withdraw failed"
        );

        emit TokensWithdrawn(proposalId, msg.sender, amount);
    }

    function calculateResults(bytes32 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.startTime > 0, "Proposal does not exist");
        require(block.timestamp > p.endTime, "Voting still in progress");
        require(!p.resultsCalculated, "Results already calculated");

        uint256 optionCount = p.options.length;
        uint256[] memory voteCounts = new uint256[](optionCount);
        uint256 totalVotes = p.totalVotes;
        uint256 maxVotes = 0;

        // Calculate vote counts and find maximum
        for (uint256 i = 0; i < optionCount; i++) {
            uint256 count = proposalVotes[proposalId][p.options[i]];
            voteCounts[i] = count;
            if (count > maxVotes) {
                maxVotes = count;
            }
        }

        bool noVotes = (totalVotes == 0);
        bool quorumMet = (totalVotes >= quorum);
        bool thresholdMet = false;
        bool tie = false;
        uint256[] memory winners;

        if (!noVotes && quorumMet) {
            // Check for tie
            uint256 winnersCount = 0;
            for (uint256 i = 0; i < optionCount; i++) {
                if (voteCounts[i] == maxVotes) {
                    winnersCount++;
                }
            }

            tie = (winnersCount > 1);

            // Calculate threshold (>50% of total votes)
            thresholdMet = (maxVotes * 100 > totalVotes * 50);

            // Set winners only if threshold met and no tie
            if (thresholdMet && !tie) {
                winners = new uint256[](1);
                for (uint256 i = 0; i < optionCount; i++) {
                    if (voteCounts[i] == maxVotes) {
                        winners[0] = p.options[i];
                        break;
                    }
                }
            } else {
                winners = new uint256[](0);
            }
        } else {
            winners = new uint256[](0);
        }

        // Store results
        ProposalResults storage result = proposalResults[proposalId];
        result.winners = winners;
        result.voteCounts = voteCounts;
        result.totalVotes = totalVotes;
        result.tie = tie;
        result.noVotes = noVotes;
        result.thresholdMet = thresholdMet;
        result.quorumMet = quorumMet;

        p.resultsCalculated = true;

        emit ProposalResultCalculated(
            proposalId,
            winners,
            voteCounts,
            totalVotes,
            tie,
            noVotes,
            thresholdMet,
            quorumMet
        );
    }

    function getProposalResults(
        bytes32 proposalId
    )
        external
        view
        returns (
            uint256[] memory winners,
            uint256[] memory voteCounts,
            uint256 totalVotes,
            bool tie,
            bool noVotes,
            bool thresholdMet,
            bool quorumMet
        )
    {
        require(proposals[proposalId].startTime > 0, "Proposal does not exist");
        require(
            proposals[proposalId].resultsCalculated,
            "Results not calculated yet"
        );

        ProposalResults storage result = proposalResults[proposalId];
        return (
            result.winners,
            result.voteCounts,
            result.totalVotes,
            result.tie,
            result.noVotes,
            result.thresholdMet,
            result.quorumMet
        );
    }

    function executeProposal(bytes32 proposalId) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(p.startTime > 0, "Proposal does not exist");
        require(msg.sender == p.creator, "Only creator can execute");
        require(!p.executed, "Proposal already executed");
        require(block.timestamp > p.endTime, "Voting period not ended");
        require(
            block.timestamp > p.endTime + timeLockDuration,
            "Timelock not expired"
        );
        require(p.resultsCalculated, "Results not calculated");

        ProposalResults storage result = proposalResults[proposalId];
        require(result.quorumMet, "Quorum not met");
        require(result.thresholdMet, "Threshold not met");
        require(!result.tie, "Proposal ended in tie");
        require(!result.noVotes, "No votes cast");
        require(result.winners.length > 0, "No winner determined");

        p.executed = true;

        emit ProposalExecuted(proposalId, msg.sender, true);
    }

    function getProposal(
        bytes32 proposalId
    )
        external
        view
        returns (
            bytes32 id,
            string memory description,
            address creator,
            uint256 startTime,
            uint256 endTime,
            uint256[] memory options,
            bool executed,
            uint256 totalVotes,
            bool resultsCalculated
        )
    {
        Proposal storage p = proposals[proposalId];
        require(p.startTime > 0, "Proposal does not exist");

        return (
            p.id,
            p.description,
            p.creator,
            p.startTime,
            p.endTime,
            p.options,
            p.executed,
            p.totalVotes,
            p.resultsCalculated
        );
    }

    function getVoteCount(
        bytes32 proposalId,
        uint256 option
    ) external view returns (uint256) {
        return proposalVotes[proposalId][option];
    }

    function getVoterInfo(
        bytes32 proposalId,
        address voter
    )
        external
        view
        returns (bool hasVoted, uint256 weight, uint256 votedOption)
    {
        Voter storage v = votes[proposalId][voter];
        return (v.hasVoted, v.weight, v.votedOption);
    }

    function getLockedTokens(
        bytes32 proposalId,
        address voter
    ) external view returns (uint256) {
        return lockedTokens[proposalId][voter];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setTimeLockDuration(uint256 _timeLockDuration) external onlyOwner {
        timeLockDuration = _timeLockDuration;
    }

    function setQuorum(uint256 _quorum) external onlyOwner {
        require(_quorum > 0, "Quorum must be greater than 0");
        quorum = _quorum;
    }

    function setMinBalance(uint256 _minBalance) external onlyOwner {
        minBalance = _minBalance;
    }
}
