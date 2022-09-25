import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";
import { hardcodedFee } from "utils/contants";

const useDepositCreditAccount = (
  accountId: string,
  denom: string,
  amount: number
) => {
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
        contractAddresses.creditManager,
        {
          update_credit_account: {
            account_id: accountId,
            actions: [
              {
                deposit: {
                  denom,
                  amount: String(amount),
                },
              },
            ],
          },
        },
        hardcodedFee,
        undefined,
        [
          {
            denom,
            amount: String(amount),
          },
        ]
      ),
    {
      onError: (err: Error) => {
        toast.error(err.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["injectiveBalance"]);
        queryClient.invalidateQueries(["creditAccountPositions"]);

        toast.success("Deposited Successfully");
      },
    }
  );
};

export default useDepositCreditAccount;
