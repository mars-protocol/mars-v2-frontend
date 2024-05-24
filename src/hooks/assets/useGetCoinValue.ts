import { useCallback } from 'react'

import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAssets from 'hooks/assets/useAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export default function useGetCoinValue() {
  const { data: assets } = useAssets()

  return useCallback(
    (coin: BNCoin) => {
      const asset = assets.find(byDenom(coin.denom))
      if (!asset || !asset.price) return BN_ZERO

      const decimals = asset.denom === ORACLE_DENOM ? 0 : asset.decimals * -1
      return coin.amount.shiftedBy(decimals).multipliedBy(asset.price.amount)
    },
    [assets],
  )
}
