// Get account balance example
const getBalance = async () => {
  const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getBalance",
      params: ["83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"]
    })
  });
  return await response.json();
};


// Get transaction details
const getTransaction = async (signature: string) => {
  const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getTransaction",
      params: [
        signature,
        { encoding: "json", maxSupportedTransactionVersion: 0 }
      ]
    })
  });
  return await response.json();
};


// Get multiple accounts information
const getMultipleAccounts = async (pubkeys: string[]) => {
  const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getMultipleAccounts",
      params: [
        pubkeys,
        { encoding: "jsonParsed", commitment: "confirmed" }
      ]
    })
  });
  return await response.json();
};


// Get all token accounts owned by an address
const getTokenAccountsByOwner = async (ownerAddress: string) => {
  const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getTokenAccountsByOwner",
      params: [
        ownerAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" }
      ]
    })
  });
  return await response.json();
};

// Get all accounts owned by a program
const getProgramAccounts = async (programId: string) => {
  const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getProgramAccounts",
      params: [
        programId,
        {
          encoding: "jsonParsed",
          filters: [
            { dataSize: 165 }  // Optional filter by account data size
          ]
        }
      ]
    })
  });
  return await response.json();
};