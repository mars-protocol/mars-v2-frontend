import { useContext } from "react";
import { WalletProviderContext } from "./context";

export const useWallet = () => {
  const context = useContext(WalletProviderContext);

  if (!context) {
    throw new Error("You forgot to use WalletProviderContext");
  }

  return context;
};
