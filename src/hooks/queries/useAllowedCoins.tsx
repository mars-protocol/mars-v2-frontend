import { useQuery } from '@tanstack/react-query'
import { useNetworkConfigStore } from 'stores/useNetworkConfigStore'
import { useWalletStore } from 'stores/useWalletStore'

import { queryKeys } from 'types/query-keys-factory'

type Result = string[]

const queryMsg = {
  allowed_coins: {},
}

export const useAllowedCoins = () => {
  const client = useWalletStore((s) => s.signingClient)
  const creditManagerAddress = useNetworkConfigStore((s) => s.contracts.creditManager)

  const result = useQuery<Result>(
    queryKeys.allowedCoins(),
    async () => client?.queryContractSmart(creditManagerAddress, queryMsg),
    {
      enabled: !!client,
      staleTime: Infinity,
    },
  )

  return {
    ...result,
    data: result?.data,
  }
}
