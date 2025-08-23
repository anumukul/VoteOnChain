const { ethers } = require("hardhat");


async function main(){


    const [deployer]=await ethers.getSigners();

    const ERC20Token=await ethers.getContractFactory("ERC20Mock");

    const name="VotingToken";
    const symbol="VOT";

    const intialAccount=deployer.address;
    const initialBalance=ethers.utils.parseUnits("1000",18);

    const votingToken=await ERC20Token.deploy(name,symbol,intialAccount,initialBalance);

     await votingToken.deployed();

    console.log("Voting token deplyed to Adress:",votingToken.address);


}

main().catch((error)=>{

    console.log(error);
    process.exit(1);
})