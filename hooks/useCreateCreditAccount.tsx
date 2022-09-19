import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";

// StdFee
const hardcodedFee = {
  amount: [
    {
      denom: chain.stakeCurrency.coinMinimalDenom,
      amount: "100000",
    },
  ],
  gas: "250000",
};

// 200000 gas used
const executeMsg = {
  create_credit_account: {},
};

const useCreateCreditAccount = () => {
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>();
  const address = useWalletStore((state) => state.address);

  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      if (!window.keplr) return;

      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId);
      const clientInstance = await SigningCosmWasmClient.connectWithSigner(
        chain.rpc,
        offlineSigner
      );

      setSigningClient(clientInstance);
    })();
  }, [address]);

  // TODO: missing type definitions
  return useMutation<any>(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["creditAccounts"]);
      },
    }
  );
};

export default useCreateCreditAccount;
