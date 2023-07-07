import BigNumber from 'bignumber.js'
import moment from 'moment'

import { BNCoin } from 'types/classes/BNCoin'
import { getEnabledMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'

export function truncate(text = '', [h, t]: [number, number] = [6, 6]): string {
  const head = text.slice(0, h)
  if (t === 0) return text.length > h + t ? head + '...' : text
  const tail = text.slice(-1 * t, text.length)
  if (h === 0) return text.length > h + t ? '...' + tail : text
  return text.length > h + t ? [head, tail].join('...') : text
}

export interface FormatOptions {
  decimals?: number
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: string
  suffix?: string
  rounded?: boolean
  abbreviated?: boolean
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

  if (thousandSeparator) {
    convertedAmount = BN(convertedAmount).toNumber().toLocaleString('en', {
      useGrouping: true,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    })
  }

  let returnValue = ''

  if (numberOfZeroDecimals) {
    if (numberOfZeroDecimals < maxDecimals) {
      returnValue = Number(returnValue).toFixed(numberOfZeroDecimals)
    } else {
      returnValue = Number(returnValue).toFixed(maxDecimals)
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

export function formatLeverage(leverage: number) {
  return formatValue(leverage, {
    minDecimals: 0,
    suffix: 'x',
  })
}

export function formatPercent(percent: number | string, minDecimals?: number) {
  return formatValue(+percent * 100, {
    minDecimals: minDecimals ?? 0,
    suffix: '%',
  })
}

export function formatAmountWithSymbol(coin: Coin) {
  const marketAssets = getEnabledMarketAssets()

  const asset = marketAssets.find((asset) => asset.denom === coin.denom)

  return formatValue(coin.amount, {
    decimals: asset?.decimals,
    suffix: ` ${asset?.symbol}`,
    abbreviated: true,
    rounded: true,
  })
}

export const convertPercentage = (percent: number) => {
  let percentage = percent
  if (percent >= 100) percentage = 100
  if (percent !== 0 && percent < 0.01) percentage = 0.01
  return Number(formatValue(percentage, { minDecimals: 0, maxDecimals: 0 }))
}

export function magnify(value: number | string, asset: Asset | PseudoAsset) {
  const amount = BN(value)
  return amount.isZero() ? amount : BN(value).shiftedBy(asset.decimals)
}

export function demagnify(amount: number | string | BigNumber, asset: Asset | PseudoAsset) {
  const value = BN(amount)
  return value.isZero() ? 0 : value.shiftedBy(-1 * asset.decimals).toNumber()
}

export function convertToDisplayAmount(coin: BNCoin, displayCurrency: Asset, prices: Coin[]) {
  const price = prices.find((price) => price.denom === coin.denom)
  const asset = getEnabledMarketAssets().find((asset) => asset.denom === coin.denom)
  const displayPrice = prices.find((price) => price.denom === displayCurrency.denom)

  if (!price || !asset || !displayPrice) return BN(0)

  return BN(coin.amount)
    .shiftedBy(-1 * asset.decimals)
    .multipliedBy(price.amount)
    .dividedBy(displayPrice.amount)
}

export function convertLiquidityRateToAPR(rate: number) {
  const rateMulHundred = rate * 100
  return rateMulHundred >= 0.01 ? rateMulHundred : 0.0
}
