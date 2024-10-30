import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { formatValue, getCoinAmount, getCoinValue } from 'utils/formatters'

export function checkPositionValue(
  amount: BigNumber,
  previousAmount: BigNumber,
  perpsAsset: Asset,
  params: PerpsParams,
) {
  if (amount.plus(previousAmount).isZero() || amount.isZero()) return null

  const wasLong = previousAmount.isGreaterThan(0)
  const positionValue = getCoinValue(
    BNCoin.fromDenomAndBigNumber(perpsAsset.denom, amount.plus(previousAmount).abs()),
    [perpsAsset],
  )
  const minPositionValue = params.minPositionValue.shiftedBy(-PRICE_ORACLE_DECIMALS)
  if (positionValue?.isLessThan(minPositionValue)) {
    const minPositionValueString = formatValue(minPositionValue.toNumber(), {
      abbreviated: false,
      prefix: '$',
    })
    const minPositionAmount = getCoinAmount(perpsAsset.denom, minPositionValue, [perpsAsset])
    const minPositionSize = formatValue(minPositionAmount.plus(previousAmount.abs()).toNumber(), {
      abbreviated: false,
      decimals: perpsAsset.decimals,
      suffix: ` ${perpsAsset.symbol}`,
      maxDecimals: perpsAsset.decimals,
    })
    if (!previousAmount.isZero()) {
      const introMessage = wasLong
        ? 'You are changing your Long position to a Short position.'
        : 'You are changing your Short position to a Long position.'
      return `${introMessage} To open the new position it has to be at least worth ${minPositionValueString}. To achieve that you need to set the size to ${minPositionSize} at minumum.`
    }
    return `Minimum position value is ${minPositionValueString} (${minPositionSize})`
  }

  const maxPositionValue = params.maxPositionValue
    ? params.maxPositionValue.shiftedBy(-PRICE_ORACLE_DECIMALS)
    : null
  if (maxPositionValue && positionValue?.isGreaterThan(maxPositionValue)) {
    const maxPositionValueString = formatValue(maxPositionValue.toNumber(), {
      abbreviated: true,
      prefix: '$',
    })
    const maxPositionAmount = getCoinAmount(perpsAsset.denom, maxPositionValue, [perpsAsset])
    const maxPositionSize = formatValue(maxPositionAmount.toNumber(), {
      abbreviated: true,
      decimals: perpsAsset.decimals,
      suffix: ` ${perpsAsset.symbol}`,
      maxDecimals: perpsAsset.decimals,
    })
    return `Maximum position value is ${maxPositionValueString} (${maxPositionSize})`
  }

  return null
}

export function checkOpenInterest(
  perpsMarket: PerpsMarket,
  previousTradeDirection: TradeDirection,
  currentTradeDirection: TradeDirection,
  amount: BigNumber,
  previousAmount: BigNumber,
  asset: Asset,
  price: BigNumber,
  params: PerpsParams,
) {
  if (amount.plus(previousAmount).isZero()) return null

  let openInterestLong = perpsMarket.openInterest.long.times(price).shiftedBy(-asset.decimals)
  let openInterestShort = perpsMarket.openInterest.short.times(price).shiftedBy(-asset.decimals)

  if (previousTradeDirection === 'long' && currentTradeDirection === 'long') {
    openInterestLong = openInterestLong.plus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount), [asset]),
    )
  }

  if (previousTradeDirection === 'short' && currentTradeDirection === 'short') {
    openInterestShort = openInterestShort.plus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount.abs()), [asset]),
    )
  }

  if (previousTradeDirection === 'long' && currentTradeDirection === 'short') {
    openInterestLong = openInterestLong.minus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, previousAmount), [asset]),
    )
    openInterestShort = openInterestShort.plus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount.plus(previousAmount).abs()), [
        asset,
      ]),
    )
  }

  if (previousTradeDirection === 'short' && currentTradeDirection === 'long') {
    openInterestShort = openInterestShort.minus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, previousAmount), [asset]),
    )
    openInterestLong = openInterestLong.plus(
      getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount.plus(previousAmount).abs()), [
        asset,
      ]),
    )
  }

  if (openInterestLong.isGreaterThan(params.maxOpenInterestLong)) {
    return `Maximum long open interest is ${formatValue(params.maxOpenInterestLong.toNumber(), {
      abbreviated: true,
      prefix: `$`,
    })}`
  }

  if (openInterestShort.isGreaterThan(params.maxOpenInterestShort)) {
    return `Maximum short open interest is ${formatValue(params.maxOpenInterestShort.toNumber(), {
      abbreviated: true,
      prefix: `$`,
    })}`
  }

  return null
}
