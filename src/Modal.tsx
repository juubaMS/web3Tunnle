import React, { useEffect, useRef, useState } from "react";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useSwitchChain,
  useConnectors,
  useBalance,
  useEnsName,
  useEnsAvatar,
} from "./engine/hooks";
import type { Connector } from "./engine/store";

const chains = {
  base: { id: 8453 },
  mainnet: { id: 1 },
  polygon: { id: 137 },
  arbitrum: { id: 42161 },
  optimism: { id: 10 },
};
import {
  X,
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  AlertTriangle,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useWeb3Tunnle } from "./Provider";
import { WALLET_CATALOG, isRecommended } from "./catalog";
import { GenericWalletIcon, MetaMaskIcon, CoinbaseIcon, PhantomIcon, RabbyIcon, OKXIcon, TrustWalletIcon } from "./icons";
import { getChainExplorer, getChainIcon, getChainName, shortAddr } from "./utils";

function WalletIcon({ connector }: { connector: Connector }) {
  if (connector.icon) {
    return <img src={connector.icon} alt={connector.name} className="w-full h-full object-contain rounded-[10px]" />;
  }
  const id = connector.id.toLowerCase();
  const name = connector.name.toLowerCase();
  if (id === "metamask" || name.includes("metamask")) return <MetaMaskIcon />;
  if (id.includes("coinbase") || name.includes("coinbase")) return <CoinbaseIcon />;
  if (id.includes("phantom") || name.includes("phantom")) return <PhantomIcon />;
  if (id.includes("rabby") || name.includes("rabby")) return <RabbyIcon />;
  if (id.includes("okx") || name.includes("okx")) return <OKXIcon />;
  if (name.includes("trust")) return <TrustWalletIcon />;
  return <GenericWalletIcon />;
}

export function TunnleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { config } = useWeb3Tunnle();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const connectors = useConnectors();
  const { connect, isPending, variables, error: connectError } = useConnect({
    mutation: { onSuccess: onClose },
  });
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address, chainId: chains.mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined, chainId: chains.mainnet.id });

  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const supportedChainIds: number[] = [chains.base.id, chains.mainnet.id, chains.polygon.id, chains.arbitrum.id, chains.optimism.id];
  const isWrongChain = isConnected && !supportedChainIds.includes((chain?.id ?? -1) as number);
  const explorer = getChainExplorer(chain?.id, address);
  const chainName = getChainName(chain?.id);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seen = new Set<string>();
  const uniqConnectors = connectors.filter((c) => {
    const key = c.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const catalogWallets = WALLET_CATALOG.map((def) => {
    const connector = uniqConnectors.find((c) =>
      c.id === def.id ||
      c.id.toLowerCase().includes(def.id.toLowerCase()) ||
      c.name.toLowerCase().includes(def.name.toLowerCase())
    );
    return { def, connector };
  });

  const catalogIds = new Set(WALLET_CATALOG.map((d) => d.id));
  const unknownConnectors = uniqConnectors.filter((c) =>
    !catalogIds.has(c.id) &&
    !c.name.toLowerCase().includes("metamask") &&
    !c.name.toLowerCase().includes("coinbase") &&
    !c.name.toLowerCase().includes("phantom") &&
    !c.name.toLowerCase().includes("rabby") &&
    !c.name.toLowerCase().includes("okx") &&
    c.id !== "injected"
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />

      <div
        className="relative w-full sm:max-w-sm bg-white dark:bg-[#0f0f0f] rounded-t-3xl sm:rounded-2xl shadow-2xl dark:shadow-black border border-gray-200/80 dark:border-white/10 overflow-hidden"
        style={{ animation: "web3TunnleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <style>{`
          @keyframes web3TunnleIn {
            from { opacity: 0; transform: translateY(12px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
          @media (max-width: 640px) {
            @keyframes web3TunnleIn {
              from { opacity: 0; transform: translateY(40px); }
              to   { opacity: 1; transform: translateY(0);   }
            }
          }
        `}</style>

        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-bold text-gray-900 dark:text-white text-[15px] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {isConnected ? "Your Wallet" : `Connect to ${config.appName}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isConnected && address ? (
            <>
              {isWrongChain && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Wrong network.{" "}
                    <button
                      onClick={() => switchChain?.({ chainId: chains.base.id })}
                      className="font-bold underline hover:no-underline"
                    >
                      Switch to Base
                    </button>
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/50">
                    {ensAvatar ? (
                      <img src={ensAvatar} alt="ENS Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Wallet className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[15px] font-bold text-gray-900 dark:text-white truncate tracking-tight">
                      {ensName ? ensName : shortAddr(address)}
                    </p>
                    {balance && (
                      <p className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {parseFloat(balance.formatted).toFixed(4)} <span className="text-gray-500 dark:text-gray-400">{balance.symbol}</span>
                      </p>
                    )}
                  </div>
                  {!isWrongChain && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0">
                      {getChainIcon(chain?.id)}
                      <span className="text-[11px] font-bold tracking-wide">{chainName}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyAddress}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy Address"}
                  </button>
                  {explorer && (
                    <a
                      href={explorer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {explorer.label}
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  disconnect();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pb-1">
                No account needed — use your existing wallet.
              </p>

              <div className="space-y-2">
                {catalogWallets.map(({ def, connector }) => {
                  const isInstalled = !!connector;
                  const loading = isPending && connector && (variables?.connector as Connector)?.id === connector.id;
                  const recommended = isRecommended(def.id + " " + def.name, config.targetChain);

                  if (isInstalled && connector) {
                    return (
                      <button
                        key={def.id}
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 group text-left shadow-sm relative overflow-hidden"
                      >
                        {recommended && (
                          <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-blue-500 border-l-transparent" />
                        )}
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-black/5 dark:border-white/10">
                          {connector.icon
                            ? <img src={connector.icon} alt={connector.name} className="w-full h-full object-contain" />
                            : def.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex items-center flex-wrap gap-1.5">
                            {connector.name || def.name}
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 tracking-wider font-bold">INSTALLED</span>
                            {recommended && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 tracking-wider font-bold shrink-0">
                                BEST FOR {config.targetChain?.toUpperCase()}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{def.subtitle}</p>
                        </div>
                        {loading ? (
                          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </button>
                    );
                  }

                  return (
                    <a
                      key={def.id}
                      href={def.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-gray-100/70 dark:hover:bg-white/[0.03] transition-all duration-150 group text-left opacity-60 hover:opacity-80"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 opacity-60">
                        {def.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[13px] text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          {def.name}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 tracking-wider font-bold">NOT INSTALLED</span>
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{def.subtitle}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    </a>
                  );
                })}
              </div>

              {unknownConnectors.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">Also Detected</p>
                  <div className="space-y-2">
                    {unknownConnectors.map((connector) => {
                      const loading = isPending && (variables?.connector as Connector)?.id === connector.id;
                      return (
                        <button
                          key={connector.id}
                          onClick={() => connect({ connector })}
                          disabled={isPending}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 disabled:opacity-60 transition-all duration-150 group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <WalletIcon connector={connector} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                              {connector.name}
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 tracking-wider font-bold">DETECTED</span>
                            </p>
                          </div>
                          {loading ? (
                            <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {connectError && (
                <p className="text-xs text-red-500 dark:text-red-400 text-center pt-2 font-medium px-4">
                  {connectError.message.includes("User rejected")
                    ? "Connection request was cancelled."
                    : connectError.message.includes("provider")
                      ? "No wallet extension found. Please install one to continue."
                      : "Failed to connect. Please try again."}
                </p>
              )}

              <div className="pt-2 text-center flex flex-col items-center gap-1.5 border-t border-gray-100 dark:border-white/5 mt-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase">
                  POWERED BY LANIT-LABS
                </p>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 flex gap-2">
                  <a
                    href={config.termsUrl || "#"}
                    className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Terms
                  </a>
                  <span>&middot;</span>
                  <a
                    href={config.privacyUrl || "#"}
                    className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Privacy
                  </a>
                  {config.supportUrl && (
                    <>
                      <span>&middot;</span>
                      <a
                        href={config.supportUrl}
                        className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        Support
                      </a>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-4 sm:h-0" />
      </div>
    </div>
  );
}
