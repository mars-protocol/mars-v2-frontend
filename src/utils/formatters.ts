import moment from 'moment'

import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export function truncate(text = '', [h, t]: [number, number] = [6, 6]): string {
  const head = text.slice(0, h)
  if (t === 0) return text.length > h + t ? head + '...' : text
  const tail = text.slice(-1 * t, text.length)
  if (h === 0) return text.length > h + t ? '...' + tail : text
  return text.length > h + t ? [head, tail].join('...') : text
}

export const produceCountdown = (remainingTime: number) => {
  const duration = moment.duration(remainingTime, 'milliseconds')
  const days = formatValue(duration.asDays(), { minDecimals: 0, maxDecimals: 0 })

  duration.subtract(days, 'days')
  const hours = formatValue(duration.asHours(), { minDecimals: 0, maxDecimals: 0 })

  duration.subtract(hours, 'hours')
  const minutes = formatValue(duration.asMinutes(), { minDecimals: 0, maxDecimals: 0 })

  return `${days}d ${hours}h ${minutes}m`
}

export const formatValue = (amount: number | string, options?: FormatOptions): string => {
  let numberOfZeroDecimals: number | null = null
  const minDecimals = options?.minDecimals ?? 2
  const maxDecimals = options?.maxDecimals ?? 2
  let enforcedDecimals = maxDecimals
  const thousandSeparator = options?.thousandSeparator ?? true

  if (typeof amount === 'string') {
    const decimals = amount.split('.')[1] ?? null
    if (decimals && Number(decimals) === 0) {
      numberOfZeroDecimals = decimals.length
    }
  }
  let convertedAmount: BigNumber | string = BN(amount).dividedBy(10 ** (options?.decimals ?? 0))

  const amountSuffix = options?.abbreviated
    ? convertedAmount.isGreaterThanOrEqualTo(1_000_000_000)
      ? 'B'
      : convertedAmount.isGreaterThanOrEqualTo(1_000_000)
        ? 'M'
        : convertedAmount.isGreaterThanOrEqualTo(1_000)
          ? 'K'
          : false
    : ''

  if (amountSuffix === 'B') {
    convertedAmount = convertedAmount.dividedBy(1_000_000_000)
  }
  if (amountSuffix === 'M') {
    convertedAmount = convertedAmount.dividedBy(1_000_000)
  }
  if (amountSuffix === 'K') {
    convertedAmount = convertedAmount.dividedBy(1_000)
  }

  if (options?.rounded) {
    convertedAmount = convertedAmount.toFixed(maxDecimals)
  } else {
    const amountFractions = convertedAmount.toString().split('.')

    if (maxDecimals > 0) {
      if (typeof amountFractions[1] !== 'undefined') {
        if (amountFractions[1].length >= maxDecimals) {
          convertedAmount = `${amountFractions[0]}.${amountFractions[1].substr(0, maxDecimals)}`
        }
        if (amountFractions[1].length < minDecimals) {
          convertedAmount = `${amountFractions[0]}.${amountFractions[1].padEnd(minDecimals, '0')}`
        }
      }
    } else {
      convertedAmount = amountFractions[0]
    }
  }

  if (amountSuffix === 'B' || amountSuffix === 'M' || amountSuffix === 'K') {
    enforcedDecimals = 2
  }

  if (thousandSeparator) {
    convertedAmount = BN(convertedAmount).toNumber().toLocaleString('en', {
      useGrouping: true,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: enforcedDecimals,
    })
  }

  let returnValue = ''

  if (numberOfZeroDecimals) {
    if (numberOfZeroDecimals < enforcedDecimals) {
      returnValue = Number(returnValue).toFixed(numberOfZeroDecimals)
    } else {
      returnValue = Number(returnValue).toFixed(enforcedDecimals)
    }
  }

  if (options?.prefix) {
    returnValue = `${options.prefix}${returnValue}`
  }

  returnValue = `${returnValue}${convertedAmount}`
  if (amountSuffix) {
    returnValue = `${returnValue}${amountSuffix}`
  }

  if (options?.suffix) {
    returnValue = `${returnValue}${options.suffix}`
  }

  return returnValue
}

export function formatHealth(health: number) {
  return formatValue(health, {
    minDecimals: 0,
    maxDecimals: 2,
  })
}

export function formatLeverage(leverage: number) {
  return formatValue(leverage, {
    minDecimals: 2,
    suffix: 'x',
  })
}

export function formatPercent(percent: number | string, minDecimals?: number) {
  return formatValue(+percent, {
    minDecimals: minDecimals ?? 0,
    suffix: '%',
  })
}

export function formatAmountWithSymbol(coin: Coin, assets: Asset[], options?: FormatOptions) {
  const asset = assets.find((asset) => asset.denom === coin.denom)

  if (!asset) return

  return formatValue(coin.amount, {
    decimals: asset?.decimals,
    maxDecimals: asset?.decimals,
    minDecimals: 0,
    suffix: ` ${asset?.symbol}`,
    abbreviated: true,
    rounded: true,
    ...options,
  })
}

export function formatAmountToPrecision(amount: number | string, decimals: number) {
  return Number(BN(amount).toPrecision(decimals))
}

export const convertPercentage = (percent: number) => {
  let percentage = percent
  if (percent >= 100) percentage = 100
  if (percent !== 0 && percent < 0.01) percentage = 0.01
  return Number(formatValue(percentage, { minDecimals: 0, maxDecimals: 0 }))
}

export function magnify(amount: number | string, asset: Asset | PseudoAsset) {
  const _amount = BN(amount)
  return _amount.isZero() ? _amount : _amount.shiftedBy(asset.decimals)
}

export function demagnify(amount: number | string | BigNumber, asset: Asset | PseudoAsset) {
  const _amount = BN(amount)
  return _amount.isZero() ? 0 : _amount.shiftedBy(-1 * asset.decimals).toNumber()
}

function getAssetAndCoinPrice(coin: BNCoin, assets: Asset[]) {
  const asset = assets.find(byDenom(coin.denom))
  const coinPrice = asset?.price

  return { asset, coinPrice }
}

function getAdjustedCoinPrice(asset: Asset, coinPrice: BNCoin) {
  const decimals = asset.denom === ORACLE_DENOM ? 0 : asset.decimals * -1
  return coinPrice.amount.shiftedBy(decimals)
}

export function getCoinValueWithoutFallback(coin: BNCoin, assets: Asset[]) {
  const { asset, coinPrice } = getAssetAndCoinPrice(coin, assets)
  if (!coinPrice || !asset) return
  return getAdjustedCoinPrice(asset, coinPrice).multipliedBy(coin.amount)
}

export function getCoinValue(coin: BNCoin, assets: Asset[], whitelistedOnly?: boolean) {
  const { asset, coinPrice } = getAssetAndCoinPrice(coin, assets)
  if (!coinPrice || !asset) return BN_ZERO
  if (!asset.isWhitelisted && whitelistedOnly) return BN_ZERO
  return getAdjustedCoinPrice(asset, coinPrice).multipliedBy(coin.amount)
}

export function getCoinAmount(denom: string, value: BigNumber, assets: Asset[]) {
  const asset = assets.find(byDenom(denom))
  const coinPrice = asset?.price

  if (!coinPrice || !asset) return BN_ZERO

  const decimals = asset.denom === ORACLE_DENOM ? 0 : asset.decimals
  return value.dividedBy(coinPrice.amount).shiftedBy(decimals).integerValue()
}

export function convertLiquidityRateToAPR(rate: number) {
  return rate >= 0.01 ? rate : 0.0
}
