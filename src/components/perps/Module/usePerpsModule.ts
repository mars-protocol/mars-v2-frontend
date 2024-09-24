import { useMemo } from 'react'

import { checkOpenInterest, checkPositionValue } from 'components/perps/Module/validators'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpPosition from 'hooks/perps/usePerpPosition'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import usePrice from 'hooks/prices/usePrice'
import { List } from 'types/classes/List'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export default function usePerpsModule(amount: BigNumber | null) {
  const { perpsAsset } = usePerpsAsset()
  const params = usePerpsParams(perpsAsset.denom)
  const perpsMarket = usePerpsMarket()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const assets = useDepositEnabledAssets()
  const account = useCurrentAccount()
  const price = usePrice(perpsAsset.denom)
  const previousAmount = useMemo(() => perpPosition?.amount ?? BN_ZERO, [perpPosition?.amount])
  const { data: tradingFee } = useTradingFeeAndPrice(
    perpsAsset.denom,
    (amount || BN_ZERO).plus(previousAmount),
    previousAmount,
  )

  const hasActivePosition = useMemo(
    () => !!account?.perps?.find(byDenom(perpsAsset.denom)),
    [account?.perps, perpsAsset.denom],
  )

  const accountNetValue = useMemo(() => {
    if (!account || !assets) return BN_ZERO
    return getAccountNetValue(account, assets)
  }, [account, assets])

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

  const warningMessages = useMemo(() => {
    const messages = new List<string>()
    if (!params || !amount || !perpsMarket) return messages

    messages.pushIfNotEmpty(checkPositionValue(amount, previousAmount, price, perpsAsset, params))
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
