"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamic import the wallet provider with ssr: false
// This ensures wallet context is only created on client side
const WalletContextProvider = dynamic(
  () => import("./wallet-provider").then((mod) => mod.WalletContextProvider),
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
}
