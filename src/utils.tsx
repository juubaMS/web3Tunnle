import React from "react";
import { BaseIcon, PolygonIcon, ArbitrumIcon, OptimismIcon } from "./icons";

export function getChainExplorer(chainId?: number, address?: string | null): { label: string; url: string } | null {
  if (!address) return null;
  const explorers: Record<number, { label: string; base: string }> = {
    8453:   { label: "Basescan",    base: "https://basescan.org/address/" },
    1:      { label: "Etherscan",   base: "https://etherscan.io/address/" },
    137:    { label: "Polygonscan",  base: "https://polygonscan.com/address/" },
    42161:  { label: "Arbiscan",    base: "https://arbiscan.io/address/" },
    10:     { label: "Optimistic",  base: "https://optimistic.etherscan.io/address/" },
  };
  const explorer = explorers[chainId ?? 8453];
  if (!explorer) return { label: "Explorer", url: `https://basescan.org/address/${address}` };
  return { label: explorer.label, url: `${explorer.base}${address}` };
}

export function getChainIcon(chainId?: number) {
  switch (chainId) {
    case 1:
      return (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16 5v8.5L23 16 16 5z" fill="white" fillOpacity="0.6" />
          <path d="M16 5L9 16l7-2.5V5z" fill="white" />
          <path d="M16 21.5V27L23 17.5 16 21.5z" fill="white" fillOpacity="0.6" />
          <path d="M16 27v-5.5L9 17.5 16 27z" fill="white" />
          <path d="M16 20.5l7-4-7-2.5v6.5z" fill="white" fillOpacity="0.6" />
          <path d="M9 16.5l7 4v-6.5L9 16.5z" fill="white" />
        </svg>
      );
    case 137:   return <div className="w-3.5 h-3.5"><PolygonIcon /></div>;
    case 42161: return <div className="w-3.5 h-3.5"><ArbitrumIcon /></div>;
    case 10:    return <div className="w-3.5 h-3.5"><OptimismIcon /></div>;
    default:    return <div className="w-3.5 h-3.5"><BaseIcon /></div>; // Base
  }
}

export function getChainName(chainId?: number): string {
  switch (chainId) {
    case 1:     return "Ethereum";
    case 137:   return "Polygon";
    case 42161: return "Arbitrum";
    case 10:    return "Optimism";
    default:    return "Base";
  }
}

export function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
