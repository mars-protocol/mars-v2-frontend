import { useMemo } from 'react'

import { checkOpenInterest, checkPositionValue } from 'components/perps/Module/validators'
import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import usePerpPosition from 'hooks/perps/usePerpPosition'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import { BNCoin } from 'types/classes/BNCoin'
import { List } from 'types/classes/List'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import useAssets from 'hooks/assets/useAssets'

export default function usePerpsModule(amount: BigNumber | null, limitPrice: BigNumber | null) {
  const { perpsAsset } = usePerpsAsset()
  const params = usePerpsParams(perpsAsset.denom)
  const perpsMarket = usePerpsMarket()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const { data: allAssets } = useAssets()
  const account = useCurrentAccount()
  const price = perpsAsset.price?.amount ?? BN_ZERO
  const previousAmount = useMemo(() => perpPosition?.amount ?? BN_ZERO, [perpPosition?.amount])

  const hasActivePosition = useMemo(
    () => !!account?.perps?.find(byDenom(perpsAsset.denom)),
    [account?.perps, perpsAsset.denom],
  )

  const accountNetValue = useMemo(() => {
    if (!account || !allAssets) return BN_ZERO
    return getAccountNetValue(account, allAssets)
  }, [account, allAssets])

  const previousTradeDirection = useMemo(
    () => perpPosition?.tradeDirection || 'long',
    [perpPosition?.tradeDirection],
  )

  const currentTradeDirection = useMemo(
    () =>
      (previousAmount.plus(amount || BN_ZERO).isGreaterThanOrEqualTo(0)
        ? 'long'
        : 'short') as TradeDirection,
    [amount, previousAmount],
  )

  const previousLeverage = useMemo(() => {
    return previousAmount.isZero()
      ? null
      : getCoinValue(BNCoin.fromDenomAndBigNumber(perpsAsset.denom, previousAmount.abs()), [
          {
            ...perpsAsset,
            price: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, limitPrice ?? BN_ONE),
          },
        ])
          .div(accountNetValue)
          .toNumber()
  }, [accountNetValue, perpsAsset, previousAmount, limitPrice])

  const leverage = useMemo(() => {
    const totalAmount = previousAmount.plus(amount ?? BN_ZERO).abs()
    return totalAmount.isZero()
      ? 1
      : getCoinValue(BNCoin.fromDenomAndBigNumber(perpsAsset.denom, totalAmount), [
          {
            ...perpsAsset,
            price: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, limitPrice ?? BN_ONE),
          },
        ])
          .div(accountNetValue)
          .toNumber()
  }, [accountNetValue, amount, perpsAsset, previousAmount, limitPrice])

  const warningMessages = useMemo(() => {
    const messages = new List<string>()
    if (!params || !amount || amount.isZero() || !perpsMarket) return messages

    messages.pushIfNotEmpty(checkPositionValue(amount, previousAmount, perpsAsset, params))
    messages.pushIfNotEmpty(
      checkOpenInterest(
        perpsMarket,
        previousTradeDirection,
        currentTradeDirection,
        amount,
        previousAmount,
        perpsAsset,
        price,
        params,
      ),
    )

    return messages
  }, [
    amount,
    currentTradeDirection,
    params,
    perpsAsset,
    perpsMarket,
    previousAmount,
    previousTradeDirection,
    price,
  ])

  return {
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    hasActivePosition,
    warningMessages,
  }
}
