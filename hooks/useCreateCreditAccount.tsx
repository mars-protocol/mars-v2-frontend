import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import useWalletStore from "stores/useWalletStore";
import { chain } from "utils/chains";
import { contractAddresses } from "config/contracts";
import { hardcodedFee } from "utils/contants";
import useCreditManagerStore from "stores/useCreditManagerStore";

// 200000 gas used
const executeMsg = {
  create_credit_account: {},
};

const useCreateCreditAccount = () => {
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>();
  const setSelectedAccount = useCreditManagerStore(
    (state) => state.actions.setSelectedAccount
  );
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
        executeMsg,
        hardcodedFee
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["creditAccounts"]);
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
      onSuccess: (data) => {
        if (!data) return;

        // TODO: is there some better way to parse response to extract token id???
        const createdID = data.logs[0].events[2].attributes[6].value;
        setSelectedAccount(createdID);
        toast.success("New account created");
      },
    }
  );
};

export default useCreateCreditAccount;
