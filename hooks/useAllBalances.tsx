import { useQuery } from '@tanstack/react-query'

import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'

type Result = {
  balances: { amount: string; denom: string }[]
}

const useAllBalances = () => {
  const address = useWalletStore((state) => state.address)

  const result = useQuery<Result>(
    ['allBalances', address],
    () => fetch(`${chain.rest}/cosmos/bank/v1beta1/balances/${address}`).then((res) => res.json()),
    {
      enabled: !!address,
      staleTime: Infinity,
    }
  )

  return {
    ...result,
    data: result?.data?.balances,
  }
}

export default useAllBalances
