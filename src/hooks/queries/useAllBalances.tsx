import { useQuery } from '@tanstack/react-query'

import { useNetworkConfigStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

type Result = {
  balances: { amount: string; denom: string }[]
}

export const useAllBalances = () => {
  const address = useWalletStore((s) => s.address)
  const restUrl = useNetworkConfigStore((s) => s.restUrl)

  const result = useQuery<Result>(
    queryKeys.allBalances(address ?? ''),
    () => fetch(`${restUrl}/cosmos/bank/v1beta1/balances/${address}`).then((res) => res.json()),
    {
      enabled: !!address,
      staleTime: Infinity,
    },
  )

  return {
    ...result,
    data: result?.data?.balances,
  }
}
