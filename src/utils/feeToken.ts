import { NetworkCurrency } from '@delphi-labs/shuttle'
import { BN } from './helpers'
import { getCurrentFeeToken } from 'hooks/wallet/useFeeToken'

export const MIN_USDC_FEE_AMOUNT = '150000'

export const MIN_NTRN_FEE_AMOUNT = '100000'

export const LOW_NTRN_THRESHOLD = '250000'

export const DEFAULT_MIN_FEE_AMOUNT = '100000'

export function findBestFeeToken(
  balances: Coin[],
  usdcDenom: string,
  nativeDenom: string,
  assets?: Asset[],
): NetworkCurrency | undefined {
  const nativeBalance = balances.find((coin) => coin.denom === nativeDenom)
  const nativeAsset = assets?.find((asset) => asset.denom === nativeDenom)
  if (nativeBalance && BN(nativeBalance.amount).isGreaterThan(LOW_NTRN_THRESHOLD)) {
    return {
      coinDenom:
        nativeAsset?.symbol || (nativeDenom === 'untrn' ? 'NTRN' : nativeDenom.toUpperCase()),
      coinMinimalDenom: nativeDenom,
      coinDecimals: nativeAsset?.decimals || (nativeDenom === 'untrn' ? 6 : 18),
    }
  }

  const usdcBalance = balances.find((coin) => coin.denom === usdcDenom)
  const usdcAsset = assets?.find((asset) => asset.denom === usdcDenom)
  if (usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
    return {
      coinDenom: 'USDC',
      coinMinimalDenom: usdcDenom,
      coinDecimals: usdcAsset?.decimals || 6,
    }
  }

  const otherBalance = balances.find((coin) => {
    if (coin.denom === nativeDenom || coin.denom === usdcDenom) return false
    return BN(coin.amount).isGreaterThan(0)
  })

  if (otherBalance) {
    const otherAsset = assets?.find((asset) => asset.denom === otherBalance.denom)
    return {
      coinDenom: otherAsset?.symbol || otherBalance.denom.toUpperCase(),
      coinMinimalDenom: otherBalance.denom,
      coinDecimals: otherAsset?.decimals || 18,
    }
  }

  if (nativeBalance && BN(nativeBalance.amount).isGreaterThan(0)) {
    return {
      coinDenom:
        nativeAsset?.symbol || (nativeDenom === 'untrn' ? 'NTRN' : nativeDenom.toUpperCase()),
      coinMinimalDenom: nativeDenom,
      coinDecimals: nativeAsset?.decimals || (nativeDenom === 'untrn' ? 6 : 18),
    }
  }

  return undefined
}

export function calculateUsdcFeeReserve(bridgeAmount: string) {
  const totalAmount = BN(bridgeAmount)

  const selectedFeeToken = getCurrentFeeToken()
  const isUsdcFeeToken =
    selectedFeeToken?.coinMinimalDenom.includes('usdc') ||
    selectedFeeToken?.coinMinimalDenom.includes('uusdc')

  if (!isUsdcFeeToken) {
    return {
      keepAmount: '0',
      depositAmount: totalAmount.toString(),
    }
  }

  if (totalAmount.isLessThanOrEqualTo(MIN_USDC_FEE_AMOUNT)) {
    return {
      keepAmount: totalAmount.toString(),
      depositAmount: '0',
    }
  }

  return {
    keepAmount: MIN_USDC_FEE_AMOUNT,
    depositAmount: totalAmount.minus(MIN_USDC_FEE_AMOUNT).toString(),
  }
}

export function isUsdcFeeToken(): boolean {
  const selectedFeeToken = getCurrentFeeToken()
  return !!(
    selectedFeeToken &&
    (selectedFeeToken.coinMinimalDenom.includes('usdc') ||
      selectedFeeToken.coinMinimalDenom.includes('uusdc'))
  )
}

export function getTransactionFeeToken(
  balances: Coin[],
  usdcDenom: string,
  nativeDenom: string,
): NetworkCurrency | undefined {
  const selectedFeeToken = getCurrentFeeToken()
  if (selectedFeeToken) {
    const selectedTokenBalance = balances.find(
      (coin) => coin.denom === selectedFeeToken.coinMinimalDenom,
    )
    if (selectedTokenBalance && BN(selectedTokenBalance.amount).isGreaterThan(0)) {
      return selectedFeeToken
    }
  }

  return findBestFeeToken(balances, usdcDenom, nativeDenom)
}

export function isNtrnBalanceLow(balances: Coin[], nativeDenom: string): boolean {
  const nativeBalance = balances.find((coin) => coin.denom === nativeDenom)
  return !nativeBalance || BN(nativeBalance.amount).isLessThanOrEqualTo(LOW_NTRN_THRESHOLD)
}

export function deductFeeFromMax(
  maxAmount: BigNumber,
  tokenDenom: string,
  tokenDecimals: number,
): BigNumber {
  const selectedFeeToken = getCurrentFeeToken()

  if (!selectedFeeToken || selectedFeeToken.coinMinimalDenom !== tokenDenom) {
    return maxAmount
  }

  let feeReserveAmount: string

  if (tokenDenom.includes('usdc') || tokenDenom.includes('uusdc')) {
    feeReserveAmount = MIN_USDC_FEE_AMOUNT
  } else if (tokenDenom === 'untrn') {
    feeReserveAmount = MIN_NTRN_FEE_AMOUNT
  } else {
    const decimalAdjustment = tokenDecimals / 6
    feeReserveAmount = BN(DEFAULT_MIN_FEE_AMOUNT).multipliedBy(decimalAdjustment).toFixed(0)
  }

  if (maxAmount.isLessThanOrEqualTo(feeReserveAmount)) {
    return maxAmount.multipliedBy(0.1).integerValue()
  }

  return maxAmount.minus(feeReserveAmount).integerValue()
}
