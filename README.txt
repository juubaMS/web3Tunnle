web3Tunnle
================================================================================
A high-fidelity, advanced, zero-dependency EVM wallet connector SDK powered by LANIT-LABS.

web3Tunnle provides a sleek, modern, and highly customizable UI for connecting Web3 wallets to your decentralized application (dApp). Built completely from scratch with a custom, native EVM engine, it handles all the heavy lifting of wallet connections while delivering a beautifully designed, ready-to-use glassmorphic modal.

--------------------------------------------------------------------------------
Why web3Tunnle instead of Wagmi?

The Web3 ecosystem is saturated with heavy, monolithic libraries. While excellent tools like wagmi and viem have become industry standards, they often come with significant tradeoffs: massive bundle sizes, complex peer dependencies (like @tanstack/react-query), and over-engineered abstractions for simple use cases.

We built web3Tunnle to solve a specific problem: Connecting a wallet shouldn't cost you hundreds of kilobytes of JavaScript.

The web3Tunnle Advantage:
1. Zero External Web3 Dependencies: web3Tunnle completely bypasses Wagmi, Viem, and Ethers.js. It interacts directly with standard window.ethereum (EIP-1193) and modern injected wallet discovery (EIP-6963).
2. Minimalist JSON-RPC: Instead of shipping a massive Ethereum library, our custom engine implements only the exact JSON-RPC calls needed to connect, switch chains, read balances, and resolve ENS names.
3. 100% Free & Keyless: You don't need Alchemy, Infura, or any subscriptions. We use free public RPCs for balances and a keyless public API (ensideas.com) for ENS resolution.
4. No Dependency Hell: Forget about ERESOLVE errors or incompatible React Query versions. web3Tunnle only requires React.
5. Uncompromised Aesthetics: Unlike commercial generic modals (e.g., RainbowKit, Web3Modal), web3Tunnle is built for high-end LANIT-LABS projects, focusing on deep customization, micro-animations, and a premium glassmorphic UI.

--------------------------------------------------------------------------------
Features

- True Plug & Play: Drop it into your React app in seconds without wrapping your app in massive global state providers.
- Beautiful UI: Modern, glassmorphic design with smooth micro-animations.
- Multi-Chain Intelligence: Auto-detects and suggests wallets based on your target chain (Ethereum, Base, Polygon, Arbitrum, Optimism, Solana, etc.).
- Built-in Security: Clean UI designed to prevent phishing, showing transparent connection states and domains.
- Mobile Native: Fully responsive bottom-sheet interactions optimized for mobile browsers.

--------------------------------------------------------------------------------
Installation

npm install web3tunnle
or
yarn add web3tunnle
or
pnpm add web3tunnle

--------------------------------------------------------------------------------
Setup & Usage

1. Wrap your app with the Provider

Simply wrap your application with Web3TunnleProvider. You do not need to configure any external clients or engines.

import { Web3TunnleProvider } from 'web3tunnle'

export default function App({ children }) {
  return (
    <Web3TunnleProvider
      config={{
        appName: "My Awesome dApp",
        targetChain: "base", // Recommends Base-native wallets like Coinbase
        termsUrl: "/terms",
        privacyUrl: "/privacy",
      }}
    >
      {children}
    </Web3TunnleProvider>
  )
}

2. Trigger the connection modal

Anywhere inside your app, use the useWeb3Tunnle hook to open or close the modal programmatically. You can read the wallet state using our lightweight, built-in native hooks.

import { useWeb3Tunnle, useAccount } from 'web3tunnle'

export function ConnectButton() {
  const { open } = useWeb3Tunnle()
  const { address, isConnected } = useAccount()

  if (isConnected) {
    return (
      <button onClick={open} className="px-4 py-2 bg-emerald-500 text-white rounded-lg">
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    )
  }

  return (
    <button onClick={open} className="px-4 py-2 bg-black text-white rounded-lg">
      Connect Wallet
    </button>
  )
}

--------------------------------------------------------------------------------
Native Hooks API

Because web3tunnle is entirely self-contained, it ships with its own highly-optimized hooks that mirror familiar Web3 paradigms without the bloat:

- useAccount(): Returns { address, isConnected, isConnecting, chain }
- useConnect(): Returns { connect, isPending, error }
- useDisconnect(): Returns { disconnect }
- useSwitchChain(): Returns { switchChain }
- useBalance({ address }): Returns { data: { formatted, symbol } }
- useEnsName({ address }): Returns { data: string | null }

--------------------------------------------------------------------------------
Customization Config

The config prop accepted by Web3TunnleProvider takes the following options to deeply customize the experience:

- appName: string. The name of your application, displayed in the modal header.
- targetChain: string?. e.g. "base", "ethereum", "solana". Highlights recommended wallets.
- termsUrl: string?. Link to your Terms of Service.
- privacyUrl: string?. Link to your Privacy Policy.
- supportUrl: string?. Link to your Support page.

--------------------------------------------------------------------------------
License

MIT (c) LANIT-LABS
