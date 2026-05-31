import React from "react";
import {
  MetaMaskIcon,
  CoinbaseIcon,
  PhantomIcon,
  RabbyIcon,
  OKXIcon,
  TrustWalletIcon,
} from "./icons";
import type { WalletDef } from "./types";

/**
 * The built-in wallet catalog — shown in connection order.
 * Each entry gets surfaced even when the extension is not installed
 * (with an "Install" link instead of a connect button).
 */
export const WALLET_CATALOG: WalletDef[] = [
  {
    id: "metaMask",
    name: "MetaMask",
    subtitle: "Ethereum · ERC-20 · All EVM chains",
    icon: <MetaMaskIcon />,
    installUrl: "https://metamask.io/download",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism"],
  },
  {
    id: "coinbaseWalletSDK",
    name: "Coinbase Wallet",
    subtitle: "Smart Wallet · Passkey · Base native",
    icon: <CoinbaseIcon />,
    installUrl: "https://www.coinbase.com/wallet/downloads",
    chains: ["base", "ethereum", "polygon", "arbitrum", "optimism"],
  },
  {
    id: "phantom",
    name: "Phantom",
    subtitle: "Solana · Ethereum · Polygon",
    icon: <PhantomIcon />,
    installUrl: "https://phantom.com/download",
    chains: ["ethereum", "base", "polygon", "solana"],
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    subtitle: "Security-first · Multi-chain · DeFi",
    icon: <RabbyIcon />,
    installUrl: "https://rabby.io",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism"],
  },
  {
    id: "okxwallet",
    name: "OKX Wallet",
    subtitle: "Web3 · DeFi · 70+ networks",
    icon: <OKXIcon />,
    installUrl: "https://www.okx.com/web3",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "solana"],
  },
];

// Wallets detected via the generic injected provider (e.g. Trust Wallet mobile browser)
export const EXTRA_WALLETS: WalletDef[] = [
  {
    id: "trustwallet",
    name: "Trust Wallet",
    subtitle: "Mobile-first · 100+ blockchains",
    icon: <TrustWalletIcon />,
    installUrl: "https://trustwallet.com/download",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "solana"],
  },
];

/**
 * Returns true if the given wallet id/name is a strong match for the
 * configured target chain (used to display the "BEST FOR X" badge).
 */
export function isRecommended(connectorIdOrName: string, targetChain?: string): boolean {
  if (!targetChain) return false;
  const id = connectorIdOrName.toLowerCase();
  const chain = targetChain.toLowerCase();

  if (chain === "base" && id.includes("coinbase")) return true;
  if (chain === "solana" && id.includes("phantom")) return true;
  if (
    (chain === "ethereum" || chain === "arbitrum" || chain === "optimism") &&
    (id.includes("metamask") || id.includes("rabby"))
  )
    return true;
  if (chain === "polygon" && (id.includes("metamask") || id.includes("phantom"))) return true;

  return false;
}
