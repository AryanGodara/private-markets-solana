"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

/**
 * Solana Wallet Provider - Following official Solana docs pattern exactly
 * Reference: https://solana.com/docs/clients/javascript-reference
 *
 * Key points:
 * - Pass empty array for wallets[] - relies on Wallet Standard auto-detection
 * - This automatically discovers Phantom, Solflare, and other standard wallets
 * - No need to manually create adapter instances
 */
export const WalletContextProvider: FC<SolanaProviderProps> = ({ children }) => {
  // DEVNET ONLY - Safe for hackathon, no real money
  const network = WalletAdapterNetwork.Devnet;

  // Use devnet RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Empty array - Wallet Standard will auto-detect installed wallets
  // This is the recommended approach per Solana docs
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
