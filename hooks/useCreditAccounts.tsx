import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";

type Result = {
  tokens: string[];
};

const allTokensQueryMsg = {
  all_tokens: {},
};

const useCreditAccounts = () => {
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
    ["creditAccounts"],
    async () =>
      signingClient?.queryContractSmart(
        contractAddresses.accountNft,
        allTokensQueryMsg
      ),
    {
      enabled: !!address && !!signingClient,
    }
  );

  return {
    ...result,
    data: result?.data && result.data.tokens,
  };
};

export default useCreditAccounts;
