import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'

import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
import { queryKeys } from 'types/query-keys-factory'

type Result = {
  balance: {
    amount: number
    denom: string
  }
}

const useTokenBalance = (denom?: string) => {
  const address = useWalletStore((state) => state.address)

  const result = useQuery<Result>(
    queryKeys.tokenBalance(address, denom || chain.stakeCurrency.coinMinimalDenom),
    async () =>
      fetch(
        `${chain.rest}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${
          denom || chain.stakeCurrency.coinMinimalDenom
        }`
      ).then((res) => res.json()),
    {
      enabled: !!address,
    }
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

export default useTokenBalance
