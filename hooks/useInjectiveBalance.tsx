import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";

import useWalletStore from "stores/useWalletStore";

type Result = {
  balance: {
    amount: number;
    denom: string;
  };
};

const useAllBalances = () => {
  const address = useWalletStore((state) => state.address);

  const result = useQuery<Result>(
    ["injectiveBalance"],
    async () =>
      fetch(
        `https://lcd.injective.network/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=inj`
      ).then((res) => res.json()),
    {
      enabled: !!address,
    }
  );

  return {
    ...result,
    data:
      result?.data &&
      BigNumber(result.data.balance.amount)
        .div(10 ** 18)
        .toNumber(),
  };
};

export default useAllBalances;
