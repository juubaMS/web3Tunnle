import { Connector, EIP1193Provider, engineStore } from "./store";

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: EIP1193Provider;
}

interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": EIP6963AnnounceProviderEvent;
  }
  interface Window {
    ethereum?: EIP1193Provider;
    phantom?: { ethereum?: EIP1193Provider };
    rabby?: EIP1193Provider;
    okxwallet?: EIP1193Provider;
  }
}

export function startDiscovery() {
  const discovered = new Map<string, Connector>();

  const addConnector = (id: string, name: string, provider: EIP1193Provider, icon?: string) => {
    if (!discovered.has(id)) {
      const connector = { id, name, provider, icon };
      discovered.set(id, connector);
      engineStore.setState({ connectors: Array.from(discovered.values()) });
    }
  };

  // 1. Listen for EIP-6963 Announcements
  const handleAnnounce = (event: EIP6963AnnounceProviderEvent) => {
    addConnector(
      event.detail.info.rdns || event.detail.info.name,
      event.detail.info.name,
      event.detail.provider,
      event.detail.info.icon
    );
  };

  if (typeof window !== "undefined") {
    window.addEventListener("eip6963:announceProvider", handleAnnounce);
    // Request existing EIP-6963 providers
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // 2. Fallback to standard injected objects
    setTimeout(() => {
      if (window.ethereum) addConnector("injected", "MetaMask / Injected", window.ethereum);
      if (window.phantom?.ethereum) addConnector("phantom", "Phantom", window.phantom.ethereum);
      if (window.rabby) addConnector("rabby", "Rabby", window.rabby);
      if (window.okxwallet) addConnector("okxwallet", "OKX Wallet", window.okxwallet);
    }, 100);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce);
    }
  };
}

export function setupProviderListeners(connector: Connector) {
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      engineStore.setState({ isConnected: false, address: null, activeConnector: null });
    } else {
      engineStore.setState({ address: accounts[0], isConnected: true, activeConnector: connector });
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    engineStore.setState({ chainId: parseInt(chainIdHex, 16) });
  };

  const handleDisconnect = () => {
    engineStore.setState({ isConnected: false, address: null, activeConnector: null, chainId: null });
  };

  connector.provider.on("accountsChanged", handleAccountsChanged);
  connector.provider.on("chainChanged", handleChainChanged);
  connector.provider.on("disconnect", handleDisconnect);

  return () => {
    connector.provider.removeListener("accountsChanged", handleAccountsChanged);
    connector.provider.removeListener("chainChanged", handleChainChanged);
    connector.provider.removeListener("disconnect", handleDisconnect);
  };
}
