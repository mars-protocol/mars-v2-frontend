import { useCallback } from 'react'

import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import usePrices from 'hooks/prices/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export default function useGetCoinValue() {
  const { data: prices } = usePrices()
  const assets = useAllWhitelistedAssets()

  return useCallback(
    (coin: BNCoin) => {
      const asset = assets.find(byDenom(coin.denom))
      const price = prices.find(byDenom(coin.denom))
      if (!asset || !price) return BN_ZERO

      const decimals = asset.denom === ORACLE_DENOM ? 0 : asset.decimals * -1
      return coin.amount.shiftedBy(decimals).multipliedBy(price.amount)
    },
    [prices, assets],
  )
}
