import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";

type Result = string[];

const queryMsg = {
  allowed_coins: {},
};

const useAllowedCoins = () => {
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>();
  const address = useWalletStore((state) => state.address);

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

  const result = useQuery<Result>(
    ["allowedCoins"],
    async () =>
      signingClient?.queryContractSmart(
        contractAddresses.creditManager,
        queryMsg
      ),
    {
      enabled: !!address && !!signingClient,
      staleTime: Infinity,
    }
  );

  return {
    ...result,
    data: result?.data,
  };
};

export default useAllowedCoins;
