import { useSearchParams } from 'react-router-dom'
import useSWR from 'swr'

import { ASSETS } from 'constants/assets'
import { getAssetBySymbol } from 'utils/assets'
import { BN } from 'utils/helpers'

export default function usePerpsMarket() {
  const [searchParams] = useSearchParams()
  const perpsMarket = searchParams.get('perpsMarket') || ASSETS[0].symbol

  const asset = getAssetBySymbol(perpsMarket)

  return useSWR(
    `perpsMarket/${perpsMarket}`,
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
