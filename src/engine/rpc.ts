export const PUBLIC_RPCS: Record<number, string> = {
  1: "https://eth.llamarpc.com",
  8453: "https://mainnet.base.org",
  137: "https://polygon-rpc.com",
  42161: "https://arb1.arbitrum.io/rpc",
  10: "https://mainnet.optimism.io",
};

export async function rpcCall<T>(chainId: number, method: string, params: any[]): Promise<T | null> {
  const rpcUrl = PUBLIC_RPCS[chainId];
  if (!rpcUrl) return null;

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result as T;
  } catch (err) {
    console.error(`RPC Call Failed (${method}):`, err);
    return null;
  }
}

export async function fetchBalance(chainId: number, address: string) {
  const hexBalance = await rpcCall<string>(chainId, "eth_getBalance", [address, "latest"]);
  if (!hexBalance) return null;
  
  // Convert hex wei to ETH (very simplistically, avoiding large bignumber libraries for the SDK)
  // 1 ETH = 1e18 Wei.
  const wei = BigInt(hexBalance);
  const etherStr = (Number(wei) / 1e18).toString();
  return {
    formatted: etherStr,
    symbol: chainId === 137 ? "MATIC" : "ETH", // Very simple logic
  };
}

/**
 * Super basic ENS reverse resolution against Ethereum Mainnet (Chain 1).
 * The Reverse Registrar contract is at 0x084b1c3C81545d370f3634e450688481E31E5dE9
 * but normally you query the resolver. We will mock or skip full ENS to save dependencies,
 * but here's the hook structure. To keep it truly 0 dependencies, ENS resolution requires
 * a bit of complex ABI encoding/namehash. We'll leave the interface but return null 
 * unless a user provides an API key or we do raw encoding.
 */
export async function fetchEnsName(address: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
    const data = await res.json();
    return data?.name || null;
  } catch (err) {
    return null;
  }
}

export async function fetchEnsAvatar(name: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.ensideas.com/ens/resolve/${name}`);
    const data = await res.json();
    return data?.avatar || null;
  } catch (err) {
    return null;
  }
}
