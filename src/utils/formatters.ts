import BigNumber from 'bignumber.js'

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
  let convertedAmount: number | string = BN(amount)
    .dividedBy(10 ** (options?.decimals ?? 0))
    .toNumber()

  const amountSuffix = options?.abbreviated
    ? convertedAmount >= 1_000_000_000
      ? 'B'
      : convertedAmount >= 1_000_000
      ? 'M'
      : convertedAmount >= 1_000
      ? 'K'
      : false
    : ''

  if (amountSuffix === 'B') {
    convertedAmount = Number(convertedAmount) / 1_000_000_000
  }
  if (amountSuffix === 'M') {
    convertedAmount = Number(convertedAmount) / 1_000_000
  }
  if (amountSuffix === 'K') {
    convertedAmount = Number(convertedAmount) / 1_000
  }

  if (options?.rounded) {
    convertedAmount = convertedAmount.toFixed(maxDecimals)
  } else {
    const amountFractions = String(convertedAmount).split('.')
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
    convertedAmount = Number(convertedAmount).toLocaleString('en', {
      useGrouping: true,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    })
  }

  let returnValue = ''
  if (options?.prefix) {
    returnValue += options.prefix
  }

  returnValue += convertedAmount

  // Used to allow for numbers like 1.0 or 3.00 (otherwise impossible with string to number conversion)
  if (numberOfZeroDecimals) {
    if (numberOfZeroDecimals < maxDecimals) {
      returnValue = Number(returnValue).toFixed(numberOfZeroDecimals)
    } else {
      returnValue = Number(returnValue).toFixed(maxDecimals)
    }
  }

  if (amountSuffix) {
    returnValue += amountSuffix
  }

  if (options?.suffix) {
    returnValue += options.suffix
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

export function magnify(value: number | string, asset: Asset) {
  const amount = BN(value)
  return amount.isZero() ? amount : BN(value).shiftedBy(asset.decimals)
}

export function demagnify(amount: number | string | BigNumber, asset: Asset) {
  const value = BN(amount)
  return value.isZero() ? 0 : value.shiftedBy(-1 * asset.decimals).toNumber()
}

export function convertToDisplayAmount(coin: Coin, displayCurrency: Asset, prices: Coin[]) {
  const price = prices.find((price) => price.denom === coin.denom)
  const asset = getEnabledMarketAssets().find((asset) => asset.denom === coin.denom)
  const displayPrice = prices.find((price) => price.denom === displayCurrency.denom)

  if (!price || !asset || !displayPrice) return '0'

  return BN(coin.amount)
    .shiftedBy(-1 * asset.decimals)
    .times(price.amount)
    .div(displayPrice.amount)
    .toNumber()
}
