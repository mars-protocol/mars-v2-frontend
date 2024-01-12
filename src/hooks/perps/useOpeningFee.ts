import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import getOpeningFee from 'api/perps/getOpeningFee'
import useChainConfig from 'hooks/useChainConfig'
import useDebounce from 'hooks/useDebounce'

export default function useOpeningFee(denom: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)
  const enabled = !amount.isZero()

  return useSWR(enabled && `${chainConfig.id}/perps/${denom}/openingFee/${debouncedAmount}`, () =>
    getOpeningFee(chainConfig, denom, amount.toString()),
  )
}
