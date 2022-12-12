import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'

import { useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'
import { chain } from 'utils/chains'

type Result = {
  balance: {
    amount: number
    denom: string
  }
}

export const useTokenBalance = (denom?: string) => {
  const address = useWalletStore((s) => s.address)

  const result = useQuery<Result>(
    queryKeys.tokenBalance(address ?? '', denom || chain.stakeCurrency.coinMinimalDenom),
    async () =>
      fetch(
        `${chain.rest}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${
          denom || chain.stakeCurrency.coinMinimalDenom
        }`,
      ).then((res) => res.json()),
    {
      enabled: !!address,
    },
  )

  return {
    ...result,
    data: result?.data
      ? BigNumber(result.data.balance.amount)
          .div(10 ** chain.stakeCurrency.coinDecimals)
          .toNumber()
      : 0,
  }
}
