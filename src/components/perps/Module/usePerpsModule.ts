import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpPosition from 'hooks/perps/usePerpPosition'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import usePrice from 'hooks/usePrice'
import usePrices from 'hooks/usePrices'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export default function usePerpsModule(amount: BigNumber | null) {
  const { perpsAsset } = usePerpsAsset()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const account = useCurrentAccount()
  const price = usePrice(perpsAsset.denom)
  const previousAmount = useMemo(() => perpPosition?.amount ?? BN_ZERO, [perpPosition?.amount])
  const { data: tradingFee } = useTradingFeeAndPrice(
    perpsAsset.denom,
    (amount || BN_ZERO).plus(previousAmount),
    previousAmount,
  )

  const hasActivePosition = useMemo(
    () => !!account?.perps.find(byDenom(perpsAsset.denom)),
    [account?.perps, perpsAsset.denom],
  )

  const accountNetValue = useMemo(() => {
    if (!account || !prices || !assets) return BN_ZERO
    return getAccountNetValue(account, prices, assets)
  }, [account, assets, prices])

  const previousTradeDirection = useMemo(
    () => perpPosition?.tradeDirection || 'long',
    [perpPosition?.tradeDirection],
  )

  const previousLeverage = useMemo(() => {
    return previousAmount
      ? (perpPosition?.currentPrice || tradingFee?.price || price)
          .times(demagnify(previousAmount.abs(), perpsAsset))
          .div(accountNetValue)
          .plus(1)
          .toNumber()
      : null
  }, [
    accountNetValue,
    perpPosition?.currentPrice,
    perpsAsset,
    previousAmount,
    price,
    tradingFee?.price,
  ])

  const leverage = useMemo(
    () =>
      (perpPosition?.currentPrice || tradingFee?.price || price)
        .times(demagnify(previousAmount.plus(amount ?? BN_ZERO).abs(), perpsAsset))
        .div(accountNetValue)
        .plus(1)
        .toNumber(),
    [
      accountNetValue,
      amount,
      perpPosition?.currentPrice,
      perpsAsset,
      previousAmount,
      price,
      tradingFee?.price,
    ],
  )

  return {
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    hasActivePosition,
  }
}
