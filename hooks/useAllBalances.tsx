import { useQuery } from "@tanstack/react-query";

import useWalletStore from "stores/useWalletStore";

const useAllBalances = () => {
  const address = useWalletStore((state) => state.address);

  return useQuery(
    ["allBalances"],
    () =>
      fetch(
        `https://lcd.injective.network/cosmos/bank/v1beta1/balances/${address}`
      ).then((res) => res.json()),
    {
      enabled: !!address,
    }
  );
};

export default useAllBalances;
