import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import usePrices from 'hooks/usePrices'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const allAssets = useAllAssets()
  const { data: prices } = usePrices()
  const { data: limitOrders } = usePerpsLimitOrders()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount) return []

    const netValue = getAccountNetValue(currentAccount, prices, allAssets)

    const activePerpsPositions = currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        status: 'active',
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: position.currentPrice
          .times(demagnify(position.amount.abs(), asset))
          .div(netValue)
          .plus(1)
          .toNumber(),
      } as PerpPositionRow
    })

    if (!limitOrders) return activePerpsPositions

    limitOrders
      .filter((order) => order['account_id'] === currentAccount.id)
      .map((limitOrder) => {
        limitOrder.order.actions.forEach((action) => {
          const actionKeys = Object.keys(action)
        })
        return
      })

    return activePerpsPositions
  }, [allAssets, currentAccount, perpAssets, prices])
}
