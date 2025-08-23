return (
  <div className="p-8 flex flex-col items-center">
    <ConnectButton />
    {/* Navigation link to create proposal */}
    <a
      href="/create-proposal"
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Create New Proposal
    </a>
    <h1 className="mt-8 text-2xl font-bold">All Proposals</h1>
    {loading ? <p>Loading...</p> : (
      <ul className="mt-4 space-y-4 w-full max-w-2xl">
        {proposals.map((p) => (
          <li key={p.id} className="p-4 border rounded shadow">
            <div className="font-semibold">{p.description}</div>
            <div>Creator: {p.creator}</div>
            <div>Status: {p.executed ? "Executed" : "Pending"}</div>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => window.location.href = `/proposal/${p.id}`}>
              View Details
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);