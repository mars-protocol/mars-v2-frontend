import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const { data: perpsConfig } = usePerpsConfig()
  const allAssets = useDepositEnabledAssets()
  const { computeLiquidationPrice } = useHealthComputer(currentAccount)

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !currentAccount.perps || !perpsConfig) return []

    const netValue = getAccountNetValue(currentAccount, allAssets)

    return currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!
      const liquidationPrice = computeLiquidationPrice(position.denom, 'perp')

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        denom: position.denom,
        baseDenom: position.baseDenom,
        type: 'market',
        reduce_only: position.reduce_only,
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        liquidationPrice: liquidationPrice !== null ? BN(liquidationPrice) : BN_ZERO,
        leverage: position.currentPrice
          .times(demagnify(position.amount.abs(), asset))
          .div(netValue)
          .shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
          .toNumber(),
      } as PerpPositionRow
    })
  }, [currentAccount, perpsConfig, allAssets, perpAssets, computeLiquidationPrice])
}
