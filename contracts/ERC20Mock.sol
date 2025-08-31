// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    mapping(address => uint256) private _snapshots;
    uint256 private _snapshotBlock;

    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) ERC20(name, symbol) {
        _mint(initialAccount, initialBalance);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    function setBalance(address account, uint256 balance) public {
        uint256 currentBalance = balanceOf(account);
        if (balance > currentBalance) {
            _mint(account, balance - currentBalance);
        } else if (balance < currentBalance) {
            _burn(account, currentBalance - balance);
        }
    }

    function takeSnapshot() public {
        _snapshotBlock = block.number;
    }

    function snapshotBalanceOf(address account) public view returns (uint256) {
        return _snapshots[account];
    }

    function setSnapshotBalance(address account, uint256 balance) public {
        _snapshots[account] = balance;
    }
}

contract MockTargetContract {
    uint256 public value;
    address public lastCaller;
    bytes public lastData;
    bool public shouldRevert;
    string public revertMessage;

    event FunctionCalled(address caller, bytes data, uint256 newValue);
    event EmergencyAction(string message);

    function setValue(uint256 _value) external {
        lastCaller = msg.sender;
        lastData = msg.data;

        if (shouldRevert) {
            revert(revertMessage);
        }

        value = _value;
        emit FunctionCalled(msg.sender, msg.data, _value);
    }

    function setRevertBehavior(
        bool _shouldRevert,
        string memory _message
    ) external {
        shouldRevert = _shouldRevert;
        revertMessage = _message;
    }

    function emergencyPause() external {
        emit EmergencyAction("Contract paused by governance");
    }

    function complexFunction(
        uint256 param1,
        string memory param2,
        address param3
    ) external returns (bool) {
        lastCaller = msg.sender;
        lastData = msg.data;
        value = param1;
        return true;
    }

    function receivePayment() external payable {
        lastCaller = msg.sender;
        lastData = msg.data;
    }

    receive() external payable {
        lastCaller = msg.sender;
    }
}

contract VotingSystemFactory {
    event VotingSystemDeployed(
        address indexed votingSystem,
        address indexed token,
        address indexed owner,
        uint256 minBalance,
        uint256 quorum
    );

    function deployVotingSystem(
        address token,
        uint256 minBalance,
        uint256 quorum,
        string memory name
    ) external returns (address) {
        return address(0);
    }
}

library TestUtils {
    function generateProposalData(
        uint256 seed
    )
        internal
        pure
        returns (
            string memory description,
            uint256[] memory options,
            bytes memory targetData
        )
    {
        description = string(
            abi.encodePacked("Test Proposal #", toString(seed))
        );

        options = new uint256[](3);
        options[0] = 1;
        options[1] = 2;
        options[2] = 3;

        targetData = abi.encodeWithSignature("setValue(uint256)", seed);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function calculateExpectedVoteWeight(
        uint256 balance,
        uint256 requestedWeight,
        bool useDelegation,
        uint256 delegatedPower
    ) internal pure returns (uint256) {
        uint256 availablePower = balance;
        if (useDelegation) {
            availablePower += delegatedPower;
        }

        return requestedWeight > 0 ? requestedWeight : availablePower;
    }
}

contract GovernanceToken is ERC20 {
    mapping(address => bool) public minters;
    mapping(address => uint256) public mintAllowances;

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    event MinterAdded(address minter);
    event MinterRemoved(address minter);
    event MintAllowanceSet(address minter, uint256 allowance);

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max");
        _mint(initialOwner, initialSupply);
        minters[initialOwner] = true;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        require(
            mintAllowances[msg.sender] >= amount,
            "Insufficient mint allowance"
        );

        mintAllowances[msg.sender] -= amount;
        _mint(to, amount);
    }

    function addMinter(address minter) external {
        require(minters[msg.sender], "Not authorized");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external {
        require(minters[msg.sender], "Not authorized");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function setMintAllowance(address minter, uint256 allowance) external {
        require(minters[msg.sender], "Not authorized");
        mintAllowances[minter] = allowance;
        emit MintAllowanceSet(minter, allowance);
    }

    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }

    mapping(bytes32 => TimeLock) public timeLocks;

    struct TimeLock {
        address from;
        address to;
        uint256 amount;
        uint256 releaseTime;
        bool executed;
    }

    function createTimeLock(
        address to,
        uint256 amount,
        uint256 lockDuration
    ) external returns (bytes32 lockId) {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        lockId = keccak256(
            abi.encodePacked(msg.sender, to, amount, block.timestamp)
        );

        timeLocks[lockId] = TimeLock({
            from: msg.sender,
            to: to,
            amount: amount,
            releaseTime: block.timestamp + lockDuration,
            executed: false
        });

        transfer(address(this), amount);
    }

    function executeTimeLock(bytes32 lockId) external {
        TimeLock storage lock = timeLocks[lockId];
        require(lock.from != address(0), "TimeLock does not exist");
        require(!lock.executed, "TimeLock already executed");
        require(
            block.timestamp >= lock.releaseTime,
            "TimeLock not yet expired"
        );

        lock.executed = true;
        _transfer(address(this), lock.to, lock.amount);
    }
}

contract MultiSigGovernance {
    mapping(address => bool) public isOwner;
    mapping(bytes32 => mapping(address => bool)) public confirmations;
    mapping(bytes32 => Transaction) public transactions;

    address[] public owners;
    uint256 public requiredConfirmations;
    uint256 public transactionCount;

    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
        uint256 createdAt;
    }

    event TransactionSubmitted(bytes32 indexed txId, address indexed submitter);
    event TransactionConfirmed(bytes32 indexed txId, address indexed confirmer);
    event TransactionExecuted(bytes32 indexed txId);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier transactionExists(bytes32 txId) {
        require(
            transactions[txId].target != address(0),
            "Transaction does not exist"
        );
        _;
    }

    modifier notExecuted(bytes32 txId) {
        require(!transactions[txId].executed, "Transaction already executed");
        _;
    }

    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        require(_owners.length > 0, "Owners required");
        require(
            _requiredConfirmations > 0 &&
                _requiredConfirmations <= _owners.length,
            "Invalid confirmation count"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _requiredConfirmations;
    }

    function submitTransaction(
        address target,
        uint256 value,
        bytes memory data
    ) external onlyOwner returns (bytes32 txId) {
        txId = keccak256(
            abi.encodePacked(target, value, data, transactionCount++)
        );

        transactions[txId] = Transaction({
            target: target,
            value: value,
            data: data,
            executed: false,
            confirmationCount: 0,
            createdAt: block.timestamp
        });

        emit TransactionSubmitted(txId, msg.sender);
    }

    function confirmTransaction(
        bytes32 txId
    ) external onlyOwner transactionExists(txId) notExecuted(txId) {
        require(
            !confirmations[txId][msg.sender],
            "Transaction already confirmed"
        );

        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmationCount++;

        emit TransactionConfirmed(txId, msg.sender);

        if (transactions[txId].confirmationCount >= requiredConfirmations) {
            _executeTransaction(txId);
        }
    }

    function _executeTransaction(bytes32 txId) internal {
        Transaction storage transaction = transactions[txId];
        transaction.executed = true;

        (bool success, ) = transaction.target.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Transaction execution failed");

        emit TransactionExecuted(txId);
    }

    receive() external payable {}
}
