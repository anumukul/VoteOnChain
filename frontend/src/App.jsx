import {
  useAccount,
  useContractRead,
  useSimulateContract,
  useWriteContract,
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import votingAbi from './abi/VotingSystem.json';
import erc20Abi from './abi/ERC20Mock.json';

const VOTING_ADDRESS = '0x516ee2DCed524e064e1fdCb4397A08Dc51219DbC';
const ERC20_ADDRESS = '0x3C40766e14c13Ce9e62610B5C17a6623563a1517';

export default function App() {
  const { address, isConnected } = useAccount();

  // Get proposals from Voting contract
  const { data: proposals } = useContractRead({
    address: VOTING_ADDRESS,
    abi: votingAbi,
    functionName: 'getProposals',
    watch: true,
  });

  // Get user's ERC20 token balance
  const { data: balance } = useContractRead({
    address: ERC20_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0'],
    enabled: !!address,
    watch: true,
  });

  // Write contract hook for sending transactions
  const { writeContract, isPending } = useWriteContract();

  // Simulate Approve function for ERC20
  const { data: approveSim } = useSimulateContract({
    address: ERC20_ADDRESS,
    abi: erc20Abi,
    functionName: 'approve',
    args: [VOTING_ADDRESS, BigInt(1000)],
    enabled: isConnected,
  });

  // Helper: Simulate vote for a proposal
  function useVoteSim(proposalId) {
    return useSimulateContract({
      address: VOTING_ADDRESS,
      abi: votingAbi,
      functionName: 'vote',
      args: [proposalId],
      enabled: isConnected,
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-900">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Voting DApp</h1>
      <ConnectButton />
      {isConnected && (
        <>
          <div>ERC20 Balance: {balance?.toString() || 0}</div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded my-2"
            disabled={!approveSim?.request || isPending}
            onClick={() => {
              if (approveSim?.request) writeContract(approveSim.request);
            }}
          >
            Approve Token
          </button>

          {/* Display proposals and vote buttons */}
          <div className="w-full max-w-2xl mt-10">
            {(proposals || []).map((proposal, idx) => {
              // Simulate voting for each proposal
              const { data: voteSim } = useVoteSim(idx);
              return (
                <div key={idx} className="border rounded-lg p-4 mb-4 flex justify-between bg-gray-800 text-white">
                  <span>{proposal.title || `Proposal ${idx}`}</span>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={!voteSim?.request || isPending}
                    onClick={() => {
                      if (voteSim?.request) writeContract(voteSim.request);
                    }}
                  >
                    Vote
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}