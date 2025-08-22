const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
  let VotingSystem;
  let votingSystem;
  let Token;
  let token;
  let owner;
  let user1;
  let user2;
  let user3;
  let target;

  beforeEach(async function () {
    [owner, user1, user2, user3, target] = await ethers.getSigners();

   
    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20.deploy("VotingToken", "VOTE", owner.address, 3000);
    await token.deployed();

    
    await token.mint(user1.address, 1000);
    await token.mint(user2.address, 1000);
    await token.mint(user3.address, 1000);

    
    VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy(token.address, 100, 500);
    await votingSystem.deployed();

    
    await token.connect(user1).approve(votingSystem.address, 1000);
    await token.connect(user2).approve(votingSystem.address, 1000);
    await token.connect(user3).approve(votingSystem.address, 1000);
  });

  async function getProposalTimes() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const now = block.timestamp;
    return { startTime: now + 10, endTime: now + 100 };
  }

  function getOptions() {
    
    return [1, 2];
  }

  it("should create a proposal with correct params", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    const targetAddr = target.address;
    const calldata = "0x";
    const timeLock = 60;

    await expect(
      votingSystem.connect(user1).createProposal(
        "Test Proposal",
        startTime,
        endTime,
        options,
        targetAddr,
        calldata,
        timeLock
      )
    ).to.emit(votingSystem, "ProposalCreated");
    const allProposals = await votingSystem.getAllProposals();
    expect(allProposals.length).to.eq(1);
  });

  it("should not allow proposal creation with insufficient balance", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    
    await token.connect(user3).transfer(owner.address, await token.balanceOf(user3.address));
    await expect(
      votingSystem
        .connect(user3)
        .createProposal(
          "Test Proposal",
          startTime,
          endTime,
          options,
          target.address,
          "0x",
          60
        )
    ).to.be.revertedWith("Insufficient tokens to create proposal");
  });

  it("should allow voting and lock tokens", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    await votingSystem
      .connect(user1)
      .createProposal("Test", startTime, endTime, options, target.address, "0x", 60);
    const proposalId = (await votingSystem.getAllProposals())[0];

    
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      votingSystem.connect(user2).vote(proposalId, options[0], 500)
    ).to.emit(votingSystem, "VoteCast");

    const locked = await votingSystem.getLockedTokens(proposalId, user2.address);
    expect(locked).to.equal(500);
  });

  it("should prevent double voting", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    await votingSystem
      .connect(user1)
      .createProposal("Test", startTime, endTime, options, target.address, "0x", 60);
    const proposalId = (await votingSystem.getAllProposals())[0];

   
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await votingSystem.connect(user2).vote(proposalId, options[0], 100);

    await expect(
      votingSystem.connect(user2).vote(proposalId, options[1], 100)
    ).to.be.revertedWith("Already voted");
  });

  it("should allow withdrawal of locked tokens after voting", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    await votingSystem
      .connect(user1)
      .createProposal("Test", startTime, endTime, options, target.address, "0x", 60);
    const proposalId = (await votingSystem.getAllProposals())[0];

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await votingSystem.connect(user2).vote(proposalId, options[0], 200);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      votingSystem.connect(user2).withdrawLockedTokens(proposalId)
    ).to.emit(votingSystem, "TokensWithdrawn");

    const locked = await votingSystem.getLockedTokens(proposalId, user2.address);
    expect(locked).to.equal(0);
  });

  it("should calculate results correctly", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    await votingSystem
      .connect(user1)
      .createProposal("Test", startTime, endTime, options, target.address, "0x", 60);
    const proposalId = (await votingSystem.getAllProposals())[0];

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await votingSystem.connect(user2).vote(proposalId, options[0], 700);
    await votingSystem.connect(user1).vote(proposalId, options[1], 300);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(votingSystem.calculateResults(proposalId)).to.emit(
      votingSystem,
      "ProposalResultCalculated"
    );

    const results = await votingSystem.getProposalResults(proposalId);
    expect(results.totalVotes).to.equal(1000);
    expect(results.thresholdMet).to.equal(true);
    expect(results.quorumMet).to.equal(true);
    expect(results.tie).to.equal(false);
  });

  it("should only allow creator to execute proposal after timelock and successful vote", async function () {
    const { startTime, endTime } = await getProposalTimes();
    const options = getOptions();
    const customTimelock = 60;
    await votingSystem
      .connect(user1)
      .createProposal("Test", startTime, endTime, options, target.address, "0x", customTimelock);
    const proposalId = (await votingSystem.getAllProposals())[0];

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
    await ethers.provider.send("evm_mine", []);
    await votingSystem.connect(user2).vote(proposalId, options[0], 900);

    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine", []);
    await votingSystem.calculateResults(proposalId);

   
    await expect(
      votingSystem.connect(user1).executeProposal(proposalId)
    ).to.be.revertedWith("Timelock not expired");

    
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      endTime + customTimelock + 1,
    ]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      votingSystem.connect(user1).executeProposal(proposalId)
    ).to.emit(votingSystem, "ProposalExecuted");
  });

  it("should not allow execution if proposal ended in tie or threshold/quorum not met", async function () {
  const { startTime, endTime } = await getProposalTimes();
  const options = getOptions();
  await votingSystem
    .connect(user1)
    .createProposal("Test", startTime, endTime, options, target.address, "0x", 60);
  const proposalId = (await votingSystem.getAllProposals())[0];

  await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
  await ethers.provider.send("evm_mine", []);

  await votingSystem.connect(user2).vote(proposalId, options[0], 500);
  await votingSystem.connect(user1).vote(proposalId, options[1], 500);

  await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
  await ethers.provider.send("evm_mine", []);
  await votingSystem.calculateResults(proposalId);

  await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 61]);
  await ethers.provider.send("evm_mine", []);

  await expect(
    votingSystem.connect(user1).executeProposal(proposalId)
  ).to.be.revertedWith(/Proposal ended in tie|Threshold not met/);
});
  it("should allow pausing and unpausing", async function () {
    await votingSystem.pause();
    expect(await votingSystem.paused()).to.equal(true);
    await votingSystem.unpause();
    expect(await votingSystem.paused()).to.equal(false);
  });

  it("should allow only owner to set parameters", async function () {
    await expect(
      votingSystem.connect(user1).setMinBalance(200)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await votingSystem.setMinBalance(200);
    expect(await votingSystem.minBalance()).to.equal(200);

    await expect(
      votingSystem.connect(user1).setQuorum(600)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await votingSystem.setQuorum(600);
    expect(await votingSystem.quorum()).to.equal(600);

    await expect(
      votingSystem.connect(user1).setDefaultTimeLockDuration(120)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await votingSystem.setDefaultTimeLockDuration(120);
    expect(await votingSystem.defaultTimeLockDuration()).to.equal(120);
  });
});