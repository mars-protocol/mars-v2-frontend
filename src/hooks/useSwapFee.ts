import useSWR from 'swr'

import getOsmosisSwapFee from 'api/swap/getOsmosisSwapFee'
import useChainConfig from 'hooks/useChainConfig'
import { ChainInfoID } from 'types/enums/wallet'
import { STANDARD_SWAP_FEE } from 'utils/constants'

export default function useSwapFee(poolIds: string[]) {
  const chainConfig = useChainConfig()
  const { data: swapFee } = useSWR(
    `chains/${chainConfig.id}/swapFees/${poolIds.join(',')}`,
    () => {
      if (chainConfig.id === ChainInfoID.Pion1) {
        return STANDARD_SWAP_FEE
      }

      return getOsmosisSwapFee(chainConfig, poolIds)
    },
    {},
  )

  return swapFee ?? STANDARD_SWAP_FEE
}
