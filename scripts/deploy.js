

async function main(){

    const [deployer]=await ethers.getSigners();

    const tokenAddress="0x3C40766e14c13Ce9e62610B5C17a6623563a1517";

    const VotingSystem=await ethers.getContractFactory("VotingSystem");

    const minBalance=ethers.utils.parseUnits("10",18);

    const quorum=ethers.utils.parseUnits("100",18);

    const votingSystem=await VotingSystem.deploy(tokenAddress,minBalance,quorum);

    await votingSystem.deployed();

    console.log("Contract deployed tot address:", votingSystem.address);



}


main().catch((error)=>{

    console.log(error);
    process.exit(1);
})