import { useQuery } from '@tanstack/react-query'

import { useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'
import { chain } from 'utils/chains'

type Result = {
  balances: { amount: string; denom: string }[]
}

export const useAllBalances = () => {
  const address = useWalletStore((s) => s.address)

  const result = useQuery<Result>(
    queryKeys.allBalances(address ?? ''),
    () => fetch(`${chain.rest}/cosmos/bank/v1beta1/balances/${address}`).then((res) => res.json()),
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
