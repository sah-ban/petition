"use client";

if (typeof window === "undefined" && typeof global !== "undefined") {
  if (
    !global.localStorage ||
    typeof global.localStorage.getItem !== "function"
  ) {
    (global as unknown as { localStorage: unknown }).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, cookieStorage, createStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { type ReactNode, useState } from "react";

const config = getDefaultConfig({
  appName: "BasePetition",
  projectId: "demo", // Replace with your WalletConnect project ID from https://cloud.walletconnect.com
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#8b5cf6",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
