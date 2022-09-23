import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";

type Result = {
  tokens: string[];
};

const useCreditAccounts = () => {
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>();
  const address = useWalletStore((state) => state.address);

  const queryMsg = useMemo(() => {
    return {
      tokens: {
        owner: address,
      },
    };
  }, [address]);

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
    ["creditAccounts", address],
    async () =>
      signingClient?.queryContractSmart(contractAddresses.accountNft, queryMsg),
    {
      enabled: !!address && !!signingClient,
    }
  );

  return {
    ...result,
    data: useMemo(() => {
      if (!address) return [];

      return result?.data && result.data.tokens;
    }, [address, result?.data]),
  };
};

export default useCreditAccounts;
