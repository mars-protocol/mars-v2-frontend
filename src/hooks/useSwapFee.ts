import useSWR from 'swr'

import getSwapFees from 'api/swap/getPools'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/useChainConfig'

const STANDARD_SWAP_FEE = 0.002

export default function useSwapFee(poolIds: string[]) {
  const chainConfig = useChainConfig()
  const { data: pools } = useSWR(
    `chains/${chainConfig.id}/swapFees/${poolIds.join(',')}`,
    () => getSwapFees(chainConfig, poolIds),
    {},
  )

  if (!pools?.length) return STANDARD_SWAP_FEE

  return pools
    .reduce((acc, pool) => acc.plus(pool?.pool_params?.swap_fee || STANDARD_SWAP_FEE), BN_ZERO)
    .toNumber()
}
