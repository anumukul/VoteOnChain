import {ethers} from "ethers";
import VotingSystemABI from "./VotingSystemABI.json";
import ERC20SMockABI from "./ERC20MockABI.json";

export const VOTING_SYSTEM_ADDRESS="0x516ee2DCed524e064e1fdCb4397A08Dc51219DbC";
export const ERC20_TOKEN_ADDRESS="0x3C40766e14c13Ce9e62610B5C17a6623563a1517";

export function getVotingSystemContract(providerOrSigner){

    return new ethers.Contract(VOTING_SYSTEM_ADDRESS,VotingSystemABI,providerOrSigner);
}

export function getERC20TokenContract(providerOrSigner){

    return new ethers.Contract(ERC20_TOKEN_ADDRESS,ERC20SMockABI,providerOrSigner);
}
