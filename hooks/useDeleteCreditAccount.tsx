import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";
import { hardcodedFee } from "utils/contants";

const useCreateCreditAccount = (accountId: string) => {
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

  return useMutation(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.accountNft,
        {
          burn: {
            token_id: accountId,
          },
        },
        hardcodedFee
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["creditAccounts"]);
      },
      onSuccess: () => {
        toast.success("Credit Account Deleted");
      },
    }
  );
};

export default useCreateCreditAccount;
