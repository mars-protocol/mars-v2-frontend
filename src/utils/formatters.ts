import BigNumber from 'bignumber.js'

import { getTokenDecimals } from 'utils/tokens'

export function truncate(text = '', [h, t]: [number, number] = [6, 6]): string {
  const head = text.slice(0, h)
  if (t === 0) return text.length > h + t ? head + '...' : text
  const tail = text.slice(-1 * t, text.length)
  if (h === 0) return text.length > h + t ? '...' + tail : text
  return text.length > h + t ? [head, tail].join('...') : text
}

export const formatCurrency = (value: string | number) => {
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export const getTokenTotalUSDValue = (
  amount: string,
  denom: string,
  marketAssets: Asset[],
  tokenPrices?: KeyValuePair,
) => {
  if (!tokenPrices) return 0

  return (
    BigNumber(amount)
      .div(10 ** getTokenDecimals(denom, marketAssets))
      .toNumber() * tokenPrices[denom]
  )
}

export const lookup = (amount: string | number, denom: string, marketAssets: Asset[]) => {
  return BigNumber(amount)
    .div(10 ** getTokenDecimals(denom, marketAssets))
    .toNumber()
}

export const formatValue = (
  amount: number | string,
  minDecimals = 2,
  maxDecimals = 2,
  thousandSeparator = true,
  prefix: boolean | string = false,
  suffix: boolean | string = false,
  rounded = false,
  abbreviated = false,
): string => {
  let numberOfZeroDecimals: number | null = null
  if (typeof amount === 'string') {
    const decimals = amount.split('.')[1] ?? null
    if (decimals && Number(decimals) === 0) {
      numberOfZeroDecimals = decimals.length
    }
  }
  let convertedAmount: number | string = +amount || 0

  const amountSuffix = abbreviated
    ? convertedAmount >= 1_000_000_000
      ? 'B'
      : convertedAmount >= 1_000_000
      ? 'M'
      : convertedAmount >= 1_000
      ? 'K'
      : false
    : ''

  const amountPrefix = prefix

  if (amountSuffix === 'B') {
    convertedAmount = Number(amount) / 1_000_000_000
  }
  if (amountSuffix === 'M') {
    convertedAmount = Number(amount) / 1_000_000
  }
  if (amountSuffix === 'K') {
    convertedAmount = Number(amount) / 1_000
  }

  if (rounded) {
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
  if (amountPrefix) {
    returnValue += amountPrefix
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

  if (suffix) {
    returnValue += suffix
  }

  return returnValue
}
