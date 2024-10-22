import BigNumber from 'bignumber.js'
import { checkOpenInterest, checkPositionValue } from 'components/perps/Module/validators'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpPosition from 'hooks/perps/usePerpPosition'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { List } from 'types/classes/List'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify, getCoinValue } from 'utils/formatters'

export default function usePerpsModule(
  tradeDirection: TradeDirection,
  limitPrice: BigNumber | null,
) {
  const { perpsAsset } = usePerpsAsset()
  const params = usePerpsParams(perpsAsset.denom)
  const perpsMarket = usePerpsMarket()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const { data: allAssets } = useAssets()
  const account = useCurrentAccount()
  const price = perpsAsset.price?.amount ?? BN_ZERO
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const [isMaxSelected, setIsMaxSelected] = useState(false)
  const { computeMaxPerpAmount } = useHealthComputer(account)

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
          limitPrice
            ? {
                ...perpsAsset,
                price: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, limitPrice),
              }
            : perpsAsset,
        ])
          .div(accountNetValue)
          .toNumber()
  }, [accountNetValue, perpsAsset, previousAmount, limitPrice])

  const maxAmount = useMemo(() => {
    let maxAmount = computeMaxPerpAmount(perpsAsset.denom, tradeDirection)
    if (tradeDirection === 'short') maxAmount = maxAmount.plus(previousAmount)
    if (tradeDirection === 'long') maxAmount = maxAmount.minus(previousAmount)

    return BigNumber.max(maxAmount, BN_ZERO)
  }, [computeMaxPerpAmount, perpsAsset, previousAmount, tradeDirection])

  const [leverage, setLeverage] = useState<number>(0)

  const calculateLeverage = useMemo(() => {
    const totalAmount = previousAmount.plus(amount).abs()
    const newLeverage = totalAmount.isZero()
      ? 0
      : getCoinValue(BNCoin.fromDenomAndBigNumber(perpsAsset.denom, totalAmount), [
          limitPrice
            ? {
                ...perpsAsset,
                price: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, limitPrice),
              }
            : perpsAsset,
        ])
          .div(accountNetValue)
          .toNumber()
    return newLeverage
  }, [accountNetValue, amount, perpsAsset, previousAmount, limitPrice])

  const maxLeverage = useMemo(() => {
    const priceToUse = limitPrice ?? perpsAsset.price?.amount ?? BN_ZERO
    const totalPositionValue = priceToUse.times(demagnify(maxAmount.toNumber(), perpsAsset))
    const maxLeverage = totalPositionValue.div(accountNetValue).toNumber()
    if (maxLeverage === Infinity) return 0
    if (maxLeverage < 1 && maxLeverage > 0) return maxLeverage

    return Math.max(maxLeverage, 1)
  }, [maxAmount, perpsAsset, accountNetValue, limitPrice])

  const warningMessages = useMemo(() => {
    const messages = new List<string>()
    if (!params || amount.isZero() || !perpsMarket) return messages

    messages.pushIfNotEmpty(checkPositionValue(amount, previousAmount, perpsAsset, params))
    messages.pushIfNotEmpty(
      checkOpenInterest(
        perpsMarket,
        perpPosition?.tradeDirection ?? 'long',
        tradeDirection,
        amount,
        previousAmount,
        perpsAsset,
        price,
        params,
      ),
    )

    return messages
  }, [amount, tradeDirection, params, perpsAsset, perpsMarket, previousAmount, price, perpPosition])

  useEffect(() => {
    setLeverage(calculateLeverage)
  }, [calculateLeverage])

  const updateAmount = useCallback((newAmount: BigNumber) => {
    setAmount(newAmount)
  }, [])

  const updateLeverage = useCallback(
    (newLeverage: number) => {
      setLeverage(newLeverage)

      if (maxAmount.isZero() || accountNetValue.isZero()) return
      const priceToUse = limitPrice ?? perpsAsset.price?.amount ?? BN_ZERO
      if (priceToUse.isZero()) return

      const newAmount = accountNetValue
        .times(newLeverage)
        .dividedBy(priceToUse)
        .shiftedBy(perpsAsset.decimals)
      const finalAmount = BigNumber.min(newAmount, maxAmount).integerValue()

      setAmount(tradeDirection === 'long' ? finalAmount : finalAmount.negated())
    },
    [maxAmount, accountNetValue, limitPrice, perpsAsset.price, perpsAsset.decimals, tradeDirection],
  )

  return {
    maxLeverage,
    maxAmount,
    isMaxSelected,
    amount,
    leverage,
    warningMessages,
    hasActivePosition,
    previousAmount,
    previousLeverage,
    previousTradeDirection,
    currentTradeDirection,
    updateAmount,
    updateLeverage,
    setIsMaxSelected,
  }
}
