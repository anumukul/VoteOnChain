// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VotingSystem is Ownable {
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

    // ERC20 token used for eligibility and weighting
    IERC20 public votingToken;
    uint256 public minBalance; // Minimum token balance to be eligible

    constructor(address _token, uint256 _minBalance) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");

        votingToken = IERC20(_token);
        minBalance = _minBalance;
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
}
