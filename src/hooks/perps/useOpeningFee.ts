import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import getOpeningFee from 'api/perps/getOpeningFee'
import useChainConfig from 'hooks/useChainConfig'

export default function useOpeningFee(denom: string, amount: BigNumber) {
  const chainConfig = useChainConfig()

  const enabled = !amount.isZero()

  return useSWR(enabled && `${chainConfig.id}/perps/${denom}/openingFee/${amount.toString()}`, () =>
    getOpeningFee(chainConfig, denom, amount.toString()),
  )
}
