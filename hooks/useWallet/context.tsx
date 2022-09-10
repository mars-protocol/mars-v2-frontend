import React, { createContext, useCallback, useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";

export const WalletProviderContext = createContext<any>(null);

type Props = {
  children: React.ReactNode;
};

export const WalletProvider = ({ children }: Props) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isMetamaskAvailable, setIsMetamaskAvailable] = useState(false);

  useEffect(() => {
    const verifyMetamask = async () => {
      setIsMetamaskAvailable(await isMetamaskInstalled());
    };

    verifyMetamask();
  }, []);

  return (
    <WalletProviderContext.Provider
      value={{
        address,
        setAddress,
        isMetamaskAvailable,
      }}
    >
      {children}
    </WalletProviderContext.Provider>
  );
};

async function isMetamaskInstalled(): Promise<boolean> {
  const provider = await detectEthereumProvider();

  return !!provider;
}
