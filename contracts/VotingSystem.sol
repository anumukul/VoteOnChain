// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VotingSystem is Ownable, ReentrancyGuard, Pausable {
    error InvalidTokenAddress();
    error QuorumTooLow();
    error DescriptionRequired();
    error InsufficientTokensToCreate();
    error InvalidTimeRange();
    error InsufficientOptions();
    error DuplicateOptions();
    error ProposalAlreadyExists();
    error ProposalNotFound();
    error VotingNotStarted();
    error VotingEnded();
    error InvalidOption();
    error AlreadyVoted();
    error InsufficientBalance();
    error WeightExceedsBalance();
    error TokenTransferFailed();
    error VotingInProgress();
    error ResultsAlreadyCalculated();
    error ResultsNotCalculated();
    error UnauthorizedExecution();
    error ProposalAlreadyExecuted();
    error TimelockNotExpired();
    error QuorumNotMet();
    error ThresholdNotMet();
    error ProposalTied();
    error NoVotesCast();
    error NoWinnerDetermined();
    error NoTargetContract();
    error ProposalNotResolved();
    error NoTokensToWithdraw();
    error TokenWithdrawFailed();
    error InvalidDelegation();
    error ProposalExpired();
    error NotCancelable();
    error ProposalNotActive();

    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Executed,
        Canceled,
        Expired
    }

    enum VotingPowerSource {
        Balance,
        Snapshot,
        Delegated
    }

    struct Proposal {
        bytes32 id;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 snapshotBlock;
        uint256[] options;
        bool executed;
        uint256 totalVotes;
        bool resultsCalculated;
        address target;
        bytes data;
        uint256 timeLockDuration;
        uint256 executionDeadline;
        ProposalState state;
        uint256 customThreshold;
        uint256 customQuorum;
    }

    struct ProposalResults {
        uint256[] winners;
        uint256[] voteCounts;
        uint256 totalVotes;
        bool tie;
        bool noVotes;
        bool thresholdMet;
        bool quorumMet;
        uint256 calculatedAt;
    }

    struct Voter {
        bool hasVoted;
        uint256 weight;
        uint256 votedOption;
        uint256 snapshotPower;
        uint256 delegatedPower;
    }

    struct DelegationInfo {
        address delegate;
        uint256 delegatedAmount;
        address[] delegators;
        uint256 totalDelegatedPower;
    }

    IERC20 public immutable votingToken;

    uint256 public minBalance;
    uint256 public defaultQuorum;
    uint256 public defaultThreshold = 50;
    uint256 public defaultTimeLockDuration = 60;
    uint256 public defaultExecutionWindow = 7 days;
    uint256 public maxProposalDuration = 30 days;
    uint256 public minProposalDuration = 1 hours;

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => Voter)) public votes;
    mapping(bytes32 => ProposalResults) public proposalResults;
    mapping(bytes32 => mapping(uint256 => uint256)) public proposalVotes;
    mapping(bytes32 => mapping(address => uint256)) public lockedTokens;

    mapping(bytes32 => mapping(address => uint256)) public votingPowerSnapshot;
    mapping(address => uint256) public lastSnapshotBlock;

    mapping(address => DelegationInfo) public delegations;
    mapping(address => uint256) public delegationNonces;
    mapping(address => uint256) public delegatedPowerUsed;

    bytes32[] public allProposals;
    mapping(bytes32 => address[]) public proposalVoters;
    mapping(address => uint256) public voterRecords;
    mapping(address => bytes32[]) public userProposals;

    mapping(bytes32 => uint256) public proposalVoterCount;
    uint256 public constant MAX_BATCH_SIZE = 100;

    event ProposalCreated(
        bytes32 indexed id,
        string description,
        address indexed createdBy,
        uint256 startTime,
        uint256 endTime,
        uint256 snapshotBlock,
        uint256[] options,
        address target,
        bytes data,
        uint256 timeLockDuration,
        uint256 executionDeadline
    );

    event VoteCast(
        bytes32 indexed id,
        address indexed voter,
        uint256 weight,
        uint256 votedOption,
        VotingPowerSource powerSource
    );

    event ProposalResultCalculated(
        bytes32 indexed proposalId,
        uint256[] winners,
        uint256[] voteCounts,
        uint256 totalVotes,
        bool tie,
        bool noVotes,
        bool thresholdMet,
        bool quorumMet,
        ProposalState newState
    );

    event ProposalExecuted(
        bytes32 indexed proposalId,
        address indexed executor,
        bool success,
        bytes returnData
    );

    event ProposalCanceled(
        bytes32 indexed proposalId,
        address indexed canceledBy,
        string reason
    );

    event ProposalExpiredEvent(bytes32 indexed proposalId);

    event TokensWithdrawn(
        bytes32 indexed proposalId,
        address indexed voter,
        uint256 amount
    );

    event DelegationCreated(
        address indexed delegator,
        address indexed delegate,
        uint256 amount,
        uint256 nonce
    );

    event DelegationRevoked(
        address indexed delegator,
        address indexed delegate,
        uint256 amount
    );

    event SnapshotTaken(
        bytes32 indexed proposalId,
        uint256 blockNumber,
        address indexed voter,
        uint256 power
    );

    modifier proposalExists(bytes32 proposalId) {
        if (proposals[proposalId].startTime == 0) revert ProposalNotFound();
        _;
    }

    modifier onlyProposalCreator(bytes32 proposalId) {
        if (msg.sender != proposals[proposalId].creator)
            revert UnauthorizedExecution();
        _;
    }

    modifier validProposalState(
        bytes32 proposalId,
        ProposalState expectedState
    ) {
        if (proposals[proposalId].state != expectedState)
            revert InvalidOption();
        _;
    }

    constructor(
        address _token,
        uint256 _minBalance,
        uint256 _defaultQuorum
    ) Ownable() {
        if (_token == address(0)) revert InvalidTokenAddress();
        if (_defaultQuorum == 0) revert QuorumTooLow();

        votingToken = IERC20(_token);
        minBalance = _minBalance;
        defaultQuorum = _defaultQuorum;
    }

    function createProposal(
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options,
        address target,
        bytes memory data,
        uint256 timeLockDuration_,
        uint256 customThreshold,
        uint256 customQuorum
    ) external whenNotPaused returns (bytes32) {
        _validateProposalInput(description, startTime, endTime, options);

        bytes32 proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.number,
                description,
                options,
                target,
                data
            )
        );

        if (proposals[proposalId].startTime != 0)
            revert ProposalAlreadyExists();

        _createProposalStorage(
            proposalId,
            description,
            startTime,
            endTime,
            options,
            target,
            data,
            timeLockDuration_,
            customThreshold,
            customQuorum
        );

        allProposals.push(proposalId);
        userProposals[msg.sender].push(proposalId);

        return proposalId;
    }

    function _validateProposalInput(
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options
    ) internal view {
        if (bytes(description).length == 0) revert DescriptionRequired();
        if (votingToken.balanceOf(msg.sender) < minBalance)
            revert InsufficientTokensToCreate();
        if (startTime <= block.timestamp) revert InvalidTimeRange();
        if (endTime <= startTime) revert InvalidTimeRange();
        if (endTime - startTime > maxProposalDuration)
            revert InvalidTimeRange();
        if (endTime - startTime < minProposalDuration)
            revert InvalidTimeRange();
        if (options.length < 2) revert InsufficientOptions();

        for (uint i = 0; i < options.length; i++) {
            for (uint j = i + 1; j < options.length; j++) {
                if (options[i] == options[j]) revert DuplicateOptions();
            }
        }
    }

    function _createProposalStorage(
        bytes32 proposalId,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options,
        address target,
        bytes memory data,
        uint256 timeLockDuration_,
        uint256 customThreshold,
        uint256 customQuorum
    ) internal {
        uint256 timelock = timeLockDuration_ > 0
            ? timeLockDuration_
            : defaultTimeLockDuration;
        uint256 executionDeadline = endTime + timelock + defaultExecutionWindow;

        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.description = description;
        p.creator = msg.sender;
        p.startTime = startTime;
        p.endTime = endTime;
        p.snapshotBlock = block.number;
        p.executed = false;
        p.totalVotes = 0;
        p.resultsCalculated = false;
        p.target = target;
        p.data = data;
        p.timeLockDuration = timelock;
        p.executionDeadline = executionDeadline;
        p.state = ProposalState.Pending;
        p.customThreshold = customThreshold;
        p.customQuorum = customQuorum;

        for (uint i = 0; i < options.length; i++) {
            p.options.push(options[i]);
            proposalVotes[proposalId][options[i]] = 0;
        }

        emit ProposalCreated(
            proposalId,
            description,
            msg.sender,
            startTime,
            endTime,
            block.number,
            options,
            target,
            data,
            timelock,
            executionDeadline
        );
    }

    function takeSnapshot(
        bytes32 proposalId,
        address voter
    ) public proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        if (
            votingPowerSnapshot[proposalId][voter] == 0 &&
            block.timestamp < p.startTime
        ) {
            uint256 balance = votingToken.balanceOf(voter);
            uint256 totalDel = delegations[voter].totalDelegatedPower;
            uint256 usedDel = delegatedPowerUsed[voter];
            uint256 delegatedPower = usedDel < totalDel ? totalDel - usedDel : 0;
            uint256 totalPower = balance + delegatedPower;

            votingPowerSnapshot[proposalId][voter] = totalPower;
            lastSnapshotBlock[voter] = block.number;

            emit SnapshotTaken(proposalId, block.number, voter, totalPower);
        }
    }

    function batchSnapshot(
        bytes32 proposalId,
        address[] calldata voters
    ) external {
        if (voters.length > MAX_BATCH_SIZE) revert InvalidOption();

        for (uint i = 0; i < voters.length; i++) {
            takeSnapshot(proposalId, voters[i]);
        }
    }

    function delegateVotingPower(
        address to,
        uint256 amount,
        uint256 nonce
    ) external {
        if (to == msg.sender) revert InvalidDelegation();
        if (to == address(0)) revert InvalidDelegation();
        if (amount == 0) revert InvalidDelegation();
        if (nonce <= delegationNonces[msg.sender]) revert InvalidDelegation();
        if (votingToken.balanceOf(msg.sender) < amount)
            revert InsufficientBalance();

        delegationNonces[msg.sender] = nonce;

        _revokeDelegation(msg.sender);

        DelegationInfo storage delegation = delegations[msg.sender];
        delegation.delegate = to;
        delegation.delegatedAmount = amount;

        DelegationInfo storage delegateInfo = delegations[to];
        delegateInfo.delegators.push(msg.sender);
        delegateInfo.totalDelegatedPower += amount;

        if (!votingToken.transferFrom(msg.sender, address(this), amount)) {
            revert TokenTransferFailed();
        }

        emit DelegationCreated(msg.sender, to, amount, nonce);
    }

    function revokeDelegation() external {
        _revokeDelegation(msg.sender);
    }

    function _revokeDelegation(address delegator) internal {
        DelegationInfo storage delegation = delegations[delegator];

        if (delegation.delegate != address(0)) {
            address currentDelegate = delegation.delegate;
            uint256 amount = delegation.delegatedAmount;

            DelegationInfo storage delegateInfo = delegations[currentDelegate];
            uint256 total = delegateInfo.totalDelegatedPower;
            uint256 used = delegatedPowerUsed[currentDelegate];
            uint256 available = used < total ? total - used : 0;
            uint256 refundAmount = amount <= available ? amount : available;

            delegateInfo.totalDelegatedPower -= amount;
            delegatedPowerUsed[currentDelegate] = used >= amount ? used - amount : 0;

            for (uint i = 0; i < delegateInfo.delegators.length; i++) {
                if (delegateInfo.delegators[i] == delegator) {
                    delegateInfo.delegators[i] = delegateInfo.delegators[
                        delegateInfo.delegators.length - 1
                    ];
                    delegateInfo.delegators.pop();
                    break;
                }
            }

            if (refundAmount > 0 && !votingToken.transfer(delegator, refundAmount)) {
                revert TokenTransferFailed();
            }

            delegation.delegate = address(0);
            delegation.delegatedAmount = 0;

            emit DelegationRevoked(delegator, currentDelegate, amount);
        }
    }

    function vote(
        bytes32 proposalId,
        uint256 option,
        uint256 weight,
        VotingPowerSource powerSource
    ) external nonReentrant whenNotPaused proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        _updateProposalState(proposalId);

        if (p.state != ProposalState.Active) revert ProposalNotActive();
        if (block.timestamp < p.startTime) revert VotingNotStarted();
        if (block.timestamp >= p.endTime) revert VotingEnded();
        if (!_isValidOption(p, option)) revert InvalidOption();

        Voter storage v = votes[proposalId][msg.sender];
        if (v.hasVoted) revert AlreadyVoted();

        uint256 voterBalance = votingToken.balanceOf(msg.sender);
        if (voterBalance < minBalance) revert InsufficientBalance();

        uint256 voteWeight = _calculateVoteWeight(
            proposalId,
            msg.sender,
            weight,
            powerSource
        );

        uint256 tokensToLock = voteWeight;
        if (powerSource == VotingPowerSource.Delegated) {
            tokensToLock = 0;
        }

        if (tokensToLock > 0) {
            if (
                !votingToken.transferFrom(
                    msg.sender,
                    address(this),
                    tokensToLock
                )
            ) {
                revert TokenTransferFailed();
            }
            lockedTokens[proposalId][msg.sender] = tokensToLock;
        }

        proposalVotes[proposalId][option] += voteWeight;
        p.totalVotes += voteWeight;
        v.hasVoted = true;
        v.weight = voteWeight;
        v.votedOption = option;
        voterRecords[msg.sender] += 1;

        proposalVoters[proposalId].push(msg.sender);
        proposalVoterCount[proposalId]++;

        if (powerSource == VotingPowerSource.Delegated) {
            delegatedPowerUsed[msg.sender] += voteWeight;
        }

        emit VoteCast(proposalId, msg.sender, voteWeight, option, powerSource);
    }

    function _calculateVoteWeight(
        bytes32 proposalId,
        address voter,
        uint256 requestedWeight,
        VotingPowerSource powerSource
    ) internal returns (uint256) {
        uint256 availablePower;

        if (powerSource == VotingPowerSource.Balance) {
            availablePower = votingToken.balanceOf(voter);
        } else if (powerSource == VotingPowerSource.Snapshot) {
            takeSnapshot(proposalId, voter);
            availablePower = votingPowerSnapshot[proposalId][voter];
        } else if (powerSource == VotingPowerSource.Delegated) {
            uint256 total = delegations[voter].totalDelegatedPower;
            uint256 used = delegatedPowerUsed[voter];
            availablePower = used < total ? total - used : 0;
        }

        if (requestedWeight > 0) {
            if (requestedWeight > availablePower) revert WeightExceedsBalance();
            return requestedWeight;
        }

        return availablePower;
    }

    function withdrawLockedTokens(
        bytes32 proposalId
    ) external nonReentrant proposalExists(proposalId) {
        if (!_isProposalResolved(proposalId)) revert ProposalNotResolved();

        uint256 amount = lockedTokens[proposalId][msg.sender];
        if (amount == 0) revert NoTokensToWithdraw();

        lockedTokens[proposalId][msg.sender] = 0;
        if (!votingToken.transfer(msg.sender, amount))
            revert TokenWithdrawFailed();

        emit TokensWithdrawn(proposalId, msg.sender, amount);
    }

    function _isProposalResolved(
        bytes32 proposalId
    ) internal view returns (bool) {
        Proposal storage p = proposals[proposalId];
        return
            p.executed ||
            p.state == ProposalState.Defeated ||
            p.state == ProposalState.Canceled ||
            p.state == ProposalState.Expired ||
            (p.state == ProposalState.Succeeded &&
                block.timestamp > p.executionDeadline);
    }

    function calculateResults(
        bytes32 proposalId
    ) external proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        if (block.timestamp <= p.endTime) revert VotingInProgress();
        if (p.resultsCalculated) revert ResultsAlreadyCalculated();

        _performResultCalculation(proposalId, p);
    }

    function _performResultCalculation(
        bytes32 proposalId,
        Proposal storage p
    ) internal {
        uint256 optionCount = p.options.length;
        uint256[] memory voteCounts = new uint256[](optionCount);
        uint256 totalVotes = p.totalVotes;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < optionCount; i++) {
            uint256 count = proposalVotes[proposalId][p.options[i]];
            voteCounts[i] = count;
            if (count > maxVotes) {
                maxVotes = count;
            }
        }

        _storeResults(proposalId, p, voteCounts, totalVotes, maxVotes);
    }

    function _storeResults(
        bytes32 proposalId,
        Proposal storage p,
        uint256[] memory voteCounts,
        uint256 totalVotes,
        uint256 maxVotes
    ) internal {
        bool noVotes = (totalVotes == 0);
        uint256 requiredQuorum = p.customQuorum > 0
            ? p.customQuorum
            : defaultQuorum;
        uint256 requiredThreshold = p.customThreshold > 0
            ? p.customThreshold
            : defaultThreshold;

        bool quorumMet = (totalVotes >= requiredQuorum);
        bool thresholdMet = false;
        bool tie = false;
        uint256[] memory winners;

        if (!noVotes && quorumMet) {
            uint256 winnersCount = 0;
            for (uint256 i = 0; i < voteCounts.length; i++) {
                if (voteCounts[i] == maxVotes) {
                    winnersCount++;
                }
            }

            tie = (winnersCount > 1);
            thresholdMet = (maxVotes * 100 >= totalVotes * requiredThreshold);

            if (thresholdMet && !tie) {
                winners = new uint256[](1);
                for (uint256 i = 0; i < voteCounts.length; i++) {
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

        ProposalResults storage result = proposalResults[proposalId];
        result.winners = winners;
        result.voteCounts = voteCounts;
        result.totalVotes = totalVotes;
        result.tie = tie;
        result.noVotes = noVotes;
        result.thresholdMet = thresholdMet;
        result.quorumMet = quorumMet;
        result.calculatedAt = block.timestamp;

        p.resultsCalculated = true;

        ProposalState newState = (noVotes || !quorumMet || !thresholdMet || tie)
            ? ProposalState.Defeated
            : ProposalState.Succeeded;
        p.state = newState;

        emit ProposalResultCalculated(
            proposalId,
            winners,
            voteCounts,
            totalVotes,
            tie,
            noVotes,
            thresholdMet,
            quorumMet,
            newState
        );
    }

    function executeProposal(
        bytes32 proposalId
    ) external nonReentrant proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        _updateProposalState(proposalId);

        if (p.executed) revert ProposalAlreadyExecuted();
        if (block.timestamp <= p.endTime) revert VotingInProgress();
        if (block.timestamp <= p.endTime + p.timeLockDuration)
            revert TimelockNotExpired();
        if (block.timestamp > p.executionDeadline) {
            p.state = ProposalState.Expired;
            emit ProposalExpiredEvent(proposalId);
            revert ProposalExpired();
        }
        if (!p.resultsCalculated) revert ResultsNotCalculated();

        if (msg.sender != p.creator && msg.sender != owner())
            revert UnauthorizedExecution();

        ProposalResults storage result = proposalResults[proposalId];
        if (!result.quorumMet) revert QuorumNotMet();
        if (!result.thresholdMet) revert ThresholdNotMet();
        if (result.tie) revert ProposalTied();
        if (result.noVotes) revert NoVotesCast();
        if (result.winners.length == 0) revert NoWinnerDetermined();
        if (p.target == address(0)) revert NoTargetContract();

        p.executed = true;
        p.state = ProposalState.Executed;

        (bool success, bytes memory returnData) = p.target.call(p.data);

        emit ProposalExecuted(proposalId, msg.sender, success, returnData);
    }

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    function emergencyCancel(
        bytes32 proposalId,
        string calldata reason
    ) external onlyOwner whenPaused proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];

        if (p.executed) revert ProposalAlreadyExecuted();
        if (p.state == ProposalState.Canceled) revert NotCancelable();

        p.state = ProposalState.Canceled;

        emit ProposalCanceled(proposalId, msg.sender, reason);
    }

    function cancelProposal(
        bytes32 proposalId,
        string calldata reason
    ) external proposalExists(proposalId) onlyProposalCreator(proposalId) {
        Proposal storage p = proposals[proposalId];

        if (block.timestamp >= p.startTime) revert NotCancelable();
        if (p.state != ProposalState.Pending) revert NotCancelable();

        p.state = ProposalState.Canceled;

        emit ProposalCanceled(proposalId, msg.sender, reason);
    }

    function _updateProposalState(bytes32 proposalId) internal {
        Proposal storage p = proposals[proposalId];

        if (
            p.state == ProposalState.Pending && block.timestamp >= p.startTime
        ) {
            p.state = ProposalState.Active;
        }

        if (
            p.state == ProposalState.Succeeded &&
            block.timestamp > p.executionDeadline
        ) {
            p.state = ProposalState.Expired;
            emit ProposalExpiredEvent(proposalId);
        }
    }

    function getProposalState(
        bytes32 proposalId
    ) external proposalExists(proposalId) returns (ProposalState) {
        _updateProposalState(proposalId);
        return proposals[proposalId].state;
    }

    function _isValidOption(
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

    function proposalExpired(bytes32 proposalId) public view returns (bool) {
        Proposal storage p = proposals[proposalId];
        return block.timestamp > p.executionDeadline;
    }

    function getProposal(
        bytes32 proposalId
    )
        external
        view
        proposalExists(proposalId)
        returns (
            bytes32 id,
            string memory description,
            address creator,
            uint256 startTime,
            uint256 endTime,
            uint256 snapshotBlock,
            uint256[] memory options,
            bool executed,
            uint256 totalVotes,
            bool resultsCalculated,
            address target,
            bytes memory data,
            uint256 timeLockDuration,
            uint256 executionDeadline,
            ProposalState state,
            uint256 customThreshold,
            uint256 customQuorum
        )
    {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.description,
            p.creator,
            p.startTime,
            p.endTime,
            p.snapshotBlock,
            p.options,
            p.executed,
            p.totalVotes,
            p.resultsCalculated,
            p.target,
            p.data,
            p.timeLockDuration,
            p.executionDeadline,
            p.state,
            p.customThreshold,
            p.customQuorum
        );
    }

    function getProposalResults(
        bytes32 proposalId
    )
        external
        view
        proposalExists(proposalId)
        returns (
            uint256[] memory winners,
            uint256[] memory voteCounts,
            uint256 totalVotes,
            bool tie,
            bool noVotes,
            bool thresholdMet,
            bool quorumMet,
            uint256 calculatedAt
        )
    {
        if (!proposals[proposalId].resultsCalculated)
            revert ResultsNotCalculated();

        ProposalResults storage result = proposalResults[proposalId];
        return (
            result.winners,
            result.voteCounts,
            result.totalVotes,
            result.tie,
            result.noVotes,
            result.thresholdMet,
            result.quorumMet,
            result.calculatedAt
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
        returns (
            bool hasVoted,
            uint256 weight,
            uint256 votedOption,
            uint256 snapshotPower,
            uint256 delegatedPower
        )
    {
        Voter storage v = votes[proposalId][voter];
        uint256 totalDel = delegations[voter].totalDelegatedPower;
        uint256 usedDel = delegatedPowerUsed[voter];
        uint256 availableDelegated = usedDel < totalDel ? totalDel - usedDel : 0;
        return (
            v.hasVoted,
            v.weight,
            v.votedOption,
            votingPowerSnapshot[proposalId][voter],
            availableDelegated
        );
    }

    function getLockedTokens(
        bytes32 proposalId,
        address voter
    ) external view returns (uint256) {
        return lockedTokens[proposalId][voter];
    }

    function getDelegationInfo(
        address user
    )
        external
        view
        returns (
            address delegateAddress,
            uint256 delegatedAmount,
            address[] memory delegators,
            uint256 totalDelegatedPower
        )
    {
        DelegationInfo storage info = delegations[user];
        return (
            info.delegate,
            info.delegatedAmount,
            info.delegators,
            info.totalDelegatedPower
        );
    }

    function getUserVotingPower(
        address user,
        bytes32 proposalId
    ) external view returns (uint256) {
        uint256 balance = votingToken.balanceOf(user);
        uint256 totalDel = delegations[user].totalDelegatedPower;
        uint256 usedDel = delegatedPowerUsed[user];
        uint256 delegated = usedDel < totalDel ? totalDel - usedDel : 0;
        uint256 snapshot = votingPowerSnapshot[proposalId][user];

        return balance + delegated + snapshot;
    }

    function getAllProposals() external view returns (bytes32[] memory) {
        return allProposals;
    }

    function getProposalsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory proposals_) {
        uint256 totalProposals = allProposals.length;
        if (offset >= totalProposals) {
            return new bytes32[](0);
        }

        uint256 end = offset + limit;
        if (end > totalProposals) {
            end = totalProposals;
        }

        uint256 length = end - offset;
        proposals_ = new bytes32[](length);

        for (uint256 i = 0; i < length; i++) {
            proposals_[i] = allProposals[offset + i];
        }
    }

    function getUserProposals(
        address user
    ) external view returns (bytes32[] memory) {
        return userProposals[user];
    }

    function getProposalVoters(
        bytes32 proposalId
    ) external view returns (address[] memory) {
        return proposalVoters[proposalId];
    }

    function getProposalVotersPaginated(
        bytes32 proposalId,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory voters) {
        address[] storage allVoters = proposalVoters[proposalId];
        uint256 totalVoters = allVoters.length;

        if (offset >= totalVoters) {
            return new address[](0);
        }

        uint256 end = offset + limit;
        if (end > totalVoters) {
            end = totalVoters;
        }

        uint256 length = end - offset;
        voters = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            voters[i] = allVoters[offset + i];
        }
    }
}
