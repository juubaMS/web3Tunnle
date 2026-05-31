export interface TunnleConfig {
  /** Your application name, shown in the connection modal header. */
  appName: string;

  /**
   * Hint the modal about the primary chain your app targets.
   * Accepted values: "ethereum" | "base" | "polygon" | "arbitrum" | "optimism" | "solana"
   * When set, compatible wallets are marked as recommended.
   */
  targetChain?: string;

  /** URL to your Terms of Service page. */
  termsUrl?: string;

  /** URL to your Privacy Policy page. */
  privacyUrl?: string;

  /** URL to your support page or chat. */
  supportUrl?: string;
}

export interface WalletDef {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  installUrl: string;
  chains: string[];
}

export interface ModalContext {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  config: TunnleConfig;
}
