// EIP-1193 Provider Interface
export interface EIP1193Provider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  isRabby?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}

export type Connector = {
  id: string;
  name: string;
  icon?: string;
  provider: EIP1193Provider;
};

export type EngineState = {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  activeConnector: Connector | null;
  connectors: Connector[];
};

type Listener = () => void;

class EngineStore {
  private state: EngineState = {
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    activeConnector: null,
    connectors: [],
  };

  private listeners = new Set<Listener>();

  getState() {
    return this.state;
  }

  setState(partial: Partial<EngineState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const engineStore = new EngineStore();
