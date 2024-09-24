import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const allAssets = useDepositEnabledAssets()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !currentAccount.perps) return []

    const netValue = getAccountNetValue(currentAccount, allAssets)

    return currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        baseDenom: position.baseDenom,
        currentPrice: position.currentPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: position.currentPrice
          .times(demagnify(position.amount.abs(), asset))
          .div(netValue)
          .plus(1)
          .toNumber(),
      } as PerpPositionRow
    })
  }, [allAssets, currentAccount, perpAssets])
}
