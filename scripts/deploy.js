const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Starting deployment to", hre.network.name);
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

    console.log("\nDeploying ERC20Mock...");
    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.deploy(
        "Governance Token",
        "GOV",
        deployer.address,
        hre.ethers.utils.parseEther("1000000")
    );
    await token.deployed();
    console.log("ERC20Mock deployed to:", token.address);

    console.log("\nDeploying VotingSystem...");
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy(
        token.address,
        hre.ethers.utils.parseEther("100"),
        hre.ethers.utils.parseEther("1000")
    );
    await votingSystem.deployed();
    console.log("VotingSystem deployed to:", votingSystem.address);

    console.log("\nDeploying MockTargetContract...");
    const MockTargetContract = await hre.ethers.getContractFactory("MockTargetContract");
    const targetContract = await MockTargetContract.deploy();
    await targetContract.deployed();
    console.log("MockTargetContract deployed to:", targetContract.address);

    console.log("\nMinting additional tokens for testing...");
    await token.mint(deployer.address, hre.ethers.utils.parseEther("50000"));
    console.log("Minted 50,000 additional tokens");

    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        contracts: {
            ERC20Mock: {
                address: token.address,
                name: "Governance Token",
                symbol: "GOV",
                totalSupply: "1050000"
            },
            VotingSystem: {
                address: votingSystem.address,
                minBalance: "100",
                defaultQuorum: "1000"
            },
            MockTargetContract: {
                address: targetContract.address
            }
        },
        deployedAt: new Date().toISOString()
    };

    console.log("\nDeployment Summary:");
    console.log("Network:", deploymentInfo.network);
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("Token Address:", deploymentInfo.contracts.ERC20Mock.address);
    console.log("Voting System:", deploymentInfo.contracts.VotingSystem.address);
    console.log("Target Contract:", deploymentInfo.contracts.MockTargetContract.address);

    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(publicDir, 'deployment-info.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("Deployment info saved to public/deployment-info.json");

    const contractsConfig = {
        chainId: 11155111,
        contracts: {
            token: {
                address: token.address,
                abi: "ERC20Mock"
            },
            voting: {
                address: votingSystem.address,
                abi: "VotingSystem"
            },
            target: {
                address: targetContract.address,
                abi: "MockTargetContract"
            }
        }
    };
    
    fs.writeFileSync(
        path.join(publicDir, 'contracts.json'),
        JSON.stringify(contractsConfig, null, 2)
    );
    console.log("Contract config saved to public/contracts.json");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });