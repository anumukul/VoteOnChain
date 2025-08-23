"use client";
import { useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { getVotingSystemContract } from "../lib/contracts";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CreateProposal() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [description, setDescription] = useState("");
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [target, setTarget] = useState(""); // address for execution, if needed
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      if (!signer) throw new Error("Connect your wallet first.");
      // Convert date/time to UNIX timestamp
      const start = Math.floor(new Date(startTime).getTime() / 1000);
      const end = Math.floor(new Date(endTime).getTime() / 1000);

      // Example: options as array
      const options = [optionOne, optionTwo];
      const contract = getVotingSystemContract(signer);

      // Example: target can be address or 0x0 if not used
      const tx = await contract.createProposal(description, options, target || ethers.constants.AddressZero, start, end);
      await tx.wait();
      setStatus("Proposal created successfully!");
      setDescription(""); setOptionOne(""); setOptionTwo(""); setStartTime(""); setEndTime(""); setTarget("");
    } catch (err) {
      setStatus("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <ConnectButton />
      <h1 className="text-2xl font-bold mt-8 mb-6">Create a Proposal</h1>
      <form className="max-w-lg w-full space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium">Description</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">Option 1</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={optionOne} onChange={e => setOptionOne(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">Option 2</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={optionTwo} onChange={e => setOptionTwo(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">Start Time</label>
          <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">End Time</label>
          <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">Target Address (optional)</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={target} onChange={e => setTarget(e.target.value)} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Creating..." : "Create Proposal"}
        </button>
      </form>
      {status && (
        <div className="mt-6 p-3 rounded bg-gray-100 border">{status}</div>
      )}
    </div>
  );
}