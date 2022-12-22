import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'

import { useNetworkConfigStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

type Result = {
  balance: {
    amount: number
    denom: string
  }
}

export const useTokenBalance = (denom?: string) => {
  const address = useWalletStore((s) => s.address)
  const restUrl = useNetworkConfigStore((s) => s.restUrl)
  const chainInfo = useWalletStore((s) => s.chainInfo)
  const coinDecimals = chainInfo?.currencies[0].coinDecimals || 6
  const coinDenom = chainInfo?.currencies[0].coinDenom || 'uosmo'

  const result = useQuery<Result>(
    queryKeys.tokenBalance(address ?? '', denom || coinDenom),
    async () =>
      fetch(
        `${restUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom || coinDenom}`,
      ).then((res) => res.json()),
    {
      enabled: !!address,
    },
  )

  return {
    ...result,
    data: result?.data
      ? BigNumber(result.data.balance.amount)
          .div(10 ** coinDecimals)
          .toNumber()
      : 0,
  }
}
