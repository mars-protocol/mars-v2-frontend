import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const allAssets = useAllAssets()
  const { data: prices } = usePrices()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount) return []

    const netValue = getAccountNetValue(currentAccount, prices, allAssets)

    return currentAccount.perps.map((position) => {
      const price = prices.find(byDenom(position.denom))?.amount ?? BN_ZERO
      const asset = perpAssets.find(byDenom(position.denom))!
      return {
        asset,
        tradeDirection: position.tradeDirection,
        size: position.size,
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: price.times(demagnify(position.size, asset)).div(netValue).plus(1).toNumber(),
      } as PerpPositionRow
    })
  }, [allAssets, currentAccount, perpAssets, prices])
}

export type PerpPositionRow = {
  asset: Asset
  tradeDirection: TradeDirection
  size: BigNumber
  pnl: BNCoin
  entryPrice: BigNumber
  liquidationPrice: BigNumber
  leverage: number
}
