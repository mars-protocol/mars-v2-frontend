import { useSearchParams } from 'react-router-dom'
import useSWR from 'swr'

import useAsset from 'hooks/assets/useAsset'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useChainConfig from 'hooks/useChainConfig'
import { BN } from 'utils/helpers'

export default function usePerpsMarket() {
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const baseAsset = useBaseAsset()
  const perpsMarket = searchParams.get('perpsMarket') || baseAsset.symbol

  const asset = useAsset(perpsMarket)

  return useSWR(
    `chains/${chainConfig.id}/perpsMarket/${perpsMarket}`,
    async () => {
      await delay(3000)
      if (!asset) return null
      return {
        asset,
        fundingRate: BN(0.001432),
        openInterest: {
          long: BN(92901203),
          short: BN(129891203),
        },
      } as PerpsMarket
    },
    {
      fallbackData: null,
    },
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
