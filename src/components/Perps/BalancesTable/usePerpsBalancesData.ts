import { useMemo } from 'react'

import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount) return []

    return currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))
      return {
        asset,
        type: position.type,
        size: position.size,
        pnl: position.pnl,
        entryPrice: position.entryPrice,
      } as PerpPositionRow
    })
  }, [currentAccount, perpAssets])
}

export type PerpPositionRow = {
  asset: Asset
  type: 'long' | 'short'
  size: BigNumber
  pnl: BNCoin
  entryPrice: BigNumber
}
