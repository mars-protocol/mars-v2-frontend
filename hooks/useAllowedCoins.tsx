import { useQuery } from '@tanstack/react-query'

import { contractAddresses } from 'config/contracts'
import useWalletStore from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'

type Result = string[]

const queryMsg = {
  allowed_coins: {},
}

const useAllowedCoins = () => {
  const client = useWalletStore((s) => s.client)

  const result = useQuery<Result>(
    queryKeys.allowedCoins(),
    async () => client?.queryContractSmart(contractAddresses.creditManager, queryMsg),
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

export default useAllowedCoins
