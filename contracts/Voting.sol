// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;


contract VotingSystem{



    struct Proposal{

        uint256 id;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;

        uint256[] options;

        bool executed;

        mapping(uint256=>uint256) votes;


    }

    struct Voter{

        bool hasVoted;

        uint256 weight;

        uint256 votedOption;

    }

    mapping(uint256=>Proposal) proposals;

    mapping(uint256=>mapping(address=>Voter)) public votes;

    mapping(address=>uint256) public voterRecords;

    event ProposalCreated(uint256 indexed id, string description,address indexed createdBy, uint256 startTime, uint256 endTime, uint256[] options);

    event VoteCast(uint256 indexed id, address indexed voter,uint256 weight, uint256 votedOption);

    



}

