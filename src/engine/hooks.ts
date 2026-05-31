import { useState, useEffect, useCallback } from "react";
import { engineStore, Connector } from "./store";
import { fetchBalance, fetchEnsName, fetchEnsAvatar } from "./rpc";
import { setupProviderListeners } from "./discovery";

// Custom hook to subscribe to the engine store
function useEngineState() {
  const [state, setState] = useState(engineStore.getState());

  useEffect(() => {
    return engineStore.subscribe(() => setState(engineStore.getState()));
  }, []);

  return state;
}

export function useAccount() {
  const state = useEngineState();
  return {
    address: state.address,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    chain: state.chainId ? { id: state.chainId } : undefined,
  };
}

export function useConnectors() {
  const state = useEngineState();
  return state.connectors;
}

export function useConnect({ mutation }: { mutation?: { onSuccess?: () => void } } = {}) {
  const state = useEngineState();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [variables, setVariables] = useState<{ connector?: Connector }>({});

  const connect = useCallback(
    async ({ connector }: { connector: Connector }) => {
      setIsPending(true);
      setError(null);
      setVariables({ connector });
      try {
        const accounts = await connector.provider.request({ method: "eth_requestAccounts" });
        const chainIdHex = await connector.provider.request({ method: "eth_chainId" });

        engineStore.setState({
          address: accounts[0],
          chainId: parseInt(chainIdHex, 16),
          isConnected: true,
          activeConnector: connector,
        });

        setupProviderListeners(connector);

        if (mutation?.onSuccess) {
          mutation.onSuccess();
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsPending(false);
      }
    },
    [mutation]
  );

  return { connect, isPending, error, variables };
}

export function useDisconnect() {
  const disconnect = useCallback(() => {
    engineStore.setState({
      address: null,
      chainId: null,
      isConnected: false,
      activeConnector: null,
    });
  }, []);

  return { disconnect };
}

export function useSwitchChain() {
  const state = useEngineState();
  
  const switchChain = useCallback(
    async ({ chainId }: { chainId: number }) => {
      if (!state.activeConnector) return;
      const hexChainId = `0x${chainId.toString(16)}`;
      
      try {
        await state.activeConnector.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
        engineStore.setState({ chainId });
      } catch (err: any) {
        // If the chain is not added, we'd ideally call wallet_addEthereumChain here.
        console.error("Failed to switch chain", err);
      }
    },
    [state.activeConnector]
  );

  return { switchChain };
}

export function useBalance({ address }: { address?: string | null }) {
  const state = useEngineState();
  const [data, setData] = useState<{ formatted: string; symbol: string } | null>(null);

  useEffect(() => {
    if (!address || !state.chainId) {
      setData(null);
      return;
    }
    fetchBalance(state.chainId, address).then(setData);
  }, [address, state.chainId]);

  return { data };
}

export function useEnsName({ address, chainId }: { address?: string | null; chainId?: number }) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    fetchEnsName(address).then(setData);
  }, [address]);

  return { data };
}

export function useEnsAvatar({ name, chainId }: { name?: string; chainId?: number }) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    fetchEnsAvatar(name).then(setData);
  }, [name]);

  return { data };
}
