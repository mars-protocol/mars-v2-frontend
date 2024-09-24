import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { formatValue, getCoinValue } from 'utils/formatters'

export function checkPositionValue(
  amount: BigNumber,
  previousAmount: BigNumber,
  price: BigNumber,
  perpsAsset: Asset,
  params: PerpsParams,
) {
  if (amount.plus(previousAmount).isZero() || amount.isZero()) return null

  const wasLong = previousAmount.isGreaterThan(0)
  const positionValue = amount.plus(previousAmount).abs().times(price)
  if (positionValue?.isLessThan(params.minPositionValue)) {
    const minPositionValue = formatValue(params.minPositionValue.toNumber(), {
      abbreviated: true,
      prefix: '$',
      decimals: PRICE_ORACLE_DECIMALS,
    })
    const minPositionSize = formatValue(
      params.minPositionValue.div(price).plus(previousAmount.abs()).toNumber(),
      {
        abbreviated: false,
        decimals: perpsAsset.decimals,
        suffix: ` ${perpsAsset.symbol}`,
      },
    )
    if (!previousAmount.isZero()) {
      const introMessage = wasLong
        ? 'You are changing your Long position to a Short position.'
        : 'You are changing your Short position to a Long position.'
      return `${introMessage} To open the new position it has to be at least worth ${minPositionValue}. To achieve that you need to set the size to ${minPositionSize} at minumum.`
    }
    return `Minimum position value is ${minPositionValue} (${minPositionSize})`
  }

  if (params.maxPositionValue && positionValue?.isGreaterThan(params.maxPositionValue)) {
    const maxPositionValue = formatValue(params.maxPositionValue.toNumber(), {
      abbreviated: true,
      prefix: '$',
      decimals: PRICE_ORACLE_DECIMALS,
    })
    const maxPositionSize = formatValue(params.maxPositionValue.div(price).toNumber(), {
      abbreviated: true,
      decimals: perpsAsset.decimals,
      suffix: ` ${perpsAsset.symbol}`,
    })
    return `Maximum position value is ${maxPositionValue} (${maxPositionSize})`
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
  let openInterestLong = perpsMarket.openInterest.long
    .times(price)
    .shiftedBy(-PRICE_ORACLE_DECIMALS)
  let openInterestShort = perpsMarket.openInterest.short
    .times(price)
    .shiftedBy(-PRICE_ORACLE_DECIMALS)

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
