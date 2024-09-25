import { useMemo } from 'react'

import { checkOpenInterest, checkPositionValue } from 'components/perps/Module/validators'
import { BN_ZERO } from 'constants/math'
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

export default function usePerpsModule(amount: BigNumber | null) {
  const { perpsAsset } = usePerpsAsset()
  const params = usePerpsParams(perpsAsset.denom)
  const perpsMarket = usePerpsMarket()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const assets = useWhitelistedAssets()
  const account = useCurrentAccount()
  const price = perpsAsset.price?.amount ?? BN_ZERO
  const previousAmount = useMemo(() => perpPosition?.amount ?? BN_ZERO, [perpPosition?.amount])

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
      ? getCoinValue(
          BNCoin.fromDenomAndBigNumber(
            perpsAsset.denom,
            previousAmount.plus(amount ?? BN_ZERO).abs(),
          ),
          [perpsAsset],
        )
          .div(accountNetValue)
          .plus(1)
          .toNumber()
      : null
  }, [amount, accountNetValue, perpsAsset, previousAmount])

  const leverage = useMemo(
    () =>
      getCoinValue(
        BNCoin.fromDenomAndBigNumber(
          perpsAsset.denom,
          previousAmount.plus(amount ?? BN_ZERO).abs(),
        ),
        [perpsAsset],
      )
        .div(accountNetValue)
        .plus(1)
        .toNumber(),
    [accountNetValue, amount, perpsAsset, previousAmount],
  )

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
