import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePrices from 'hooks/usePrices'
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
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: position.currentPrice
          .times(demagnify(position.amount, asset))
          .div(netValue)
          .plus(1)
          .toNumber(),
      } as PerpPositionRow
    })
  }, [allAssets, currentAccount, perpAssets, prices])
}
