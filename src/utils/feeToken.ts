import { LocalStorageKeys } from 'constants/localStorageKeys'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BN } from 'utils/helpers'

export const MIN_FEE_AMOUNT = '150000'
export const LOW_NTRN_THRESHOLD = '250000'

function getNetworkCurrency(denom: string, asset: Asset, gasPrice: Coin) {
  const gasPriceStep = BN(gasPrice.amount).decimalPlaces(asset.decimals).toNumber()
  return {
    coinDenom: asset.symbol,
    coinMinimalDenom: denom,
    coinDecimals: asset.decimals,
    gasPriceStep: {
      low: gasPriceStep,
      average: gasPriceStep,
      high: gasPriceStep,
    },
  }
}

export function getAvailableFeeTokens(
  balances: Coin[],
  gasPrices: Coin[],
  chainConfig: ChainConfig,
  assets: Asset[],
  forceStable: boolean = false,
): AvailableFeeTokens[] {
  const availableTokens: { token: NetworkCurrency; balance: string; gasPrice?: string }[] = []
  const nativeCurrency = chainConfig.defaultCurrency
  const nativeBalance = balances.find((coin) => coin.denom === nativeCurrency.coinMinimalDenom)
  const nativeGasPrice = gasPrices.find((price) => price.denom === nativeCurrency.coinMinimalDenom)
  const nativeAsset = assets?.find((asset) => asset.denom === nativeCurrency.coinMinimalDenom)

  if (nativeAsset && nativeBalance && BN(nativeBalance.amount).isGreaterThan(0) && nativeGasPrice) {
    availableTokens.push({
      token: getNetworkCurrency(nativeCurrency.coinMinimalDenom, nativeAsset, nativeGasPrice),
      balance: nativeBalance.amount,
    })
  }

  const stableDenom = chainConfig.stables[0]
  const stableBalance = balances.find((coin) => coin.denom === stableDenom)
  const stableAsset = assets?.find((asset) => asset.denom === stableDenom)
  const stableGasPrice = gasPrices.find((price) => price.denom === stableDenom)
  if (
    stableAsset &&
    stableGasPrice &&
    ((stableBalance && BN(stableBalance.amount).isGreaterThan(0)) || forceStable)
  ) {
    availableTokens.push({
      token: getNetworkCurrency(stableDenom, stableAsset, stableGasPrice),
      balance: stableBalance?.amount || '0',
    })
  }

  gasPrices.forEach((price) => {
    if (price.denom === nativeCurrency.coinMinimalDenom || price.denom === stableDenom) return

    const balance = balances.find((coin) => coin.denom === price.denom)
    const asset = assets?.find((a) => a.denom === price.denom)
    if (asset && balance && BN(balance.amount).isGreaterThan(0)) {
      availableTokens.push({
        token: getNetworkCurrency(price.denom, asset, price),
        balance: balance.amount,
      })
    }
  })

  return availableTokens
    .filter((token) => token.token.coinDecimals === PRICE_ORACLE_DECIMALS)
    .sort((a, b) => {
      // First priority: native currency
      if (a.token.coinMinimalDenom === nativeCurrency.coinMinimalDenom) return -1
      if (b.token.coinMinimalDenom === nativeCurrency.coinMinimalDenom) return 1

      // Second priority: stable denom
      if (a.token.coinMinimalDenom === stableDenom) return -1
      if (b.token.coinMinimalDenom === stableDenom) return 1

      // Third priority: balance comparison (higher balance first)
      return BN(b.balance).isGreaterThan(BN(a.balance)) ? 1 : -1
    })
}

export function findBestFeeToken(
  balances: Coin[],
  gasPrices: Coin[],
  chainConfig: ChainConfig,
  assets: Asset[],
): NetworkCurrency {
  const availableTokens = getAvailableFeeTokens(balances, gasPrices, chainConfig, assets)
  if (availableTokens.length > 0) return availableTokens[0].token
  return chainConfig.defaultCurrency
}

export function calculateUsdcFeeReserve(bridgeAmount: string, chainConfig: ChainConfig) {
  const totalAmount = BN(bridgeAmount)

  const selectedFeeToken = getCurrentFeeToken(chainConfig)
  const isUsdcFeeToken = selectedFeeToken?.coinMinimalDenom === chainConfig.stables[0]

  if (!isUsdcFeeToken) {
    return {
      keepAmount: '0',
      depositAmount: totalAmount.toString(),
    }
  }

  if (totalAmount.isLessThanOrEqualTo(MIN_FEE_AMOUNT)) {
    return {
      keepAmount: totalAmount.toString(),
      depositAmount: '0',
    }
  }

  return {
    keepAmount: MIN_FEE_AMOUNT,
    depositAmount: totalAmount.minus(MIN_FEE_AMOUNT).toString(),
  }
}

export function isUsdcFeeToken(chainConfig: ChainConfig): boolean {
  const selectedFeeToken = getCurrentFeeToken(chainConfig)
  if (!selectedFeeToken) return false
  return chainConfig.stables.includes(selectedFeeToken.coinMinimalDenom)
}

export function isFeeBalanceLow(balances: Coin[], nativeDenom: string): boolean {
  const nativeBalance = balances.find((coin) => coin.denom === nativeDenom)
  return !nativeBalance || BN(nativeBalance.amount).isLessThanOrEqualTo(LOW_NTRN_THRESHOLD)
}

export function deductFeeFromMax(
  maxAmount: BigNumber,
  tokenDenom: string,
  tokenDecimals: number,
  chainConfig: ChainConfig,
): BigNumber {
  const selectedFeeToken = getCurrentFeeToken(chainConfig)

  if (!selectedFeeToken || selectedFeeToken.coinMinimalDenom !== tokenDenom) {
    return maxAmount
  }

  let feeReserveAmount: string

  if (tokenDenom.includes('usdc') || tokenDenom.includes('uusdc')) {
    feeReserveAmount = MIN_FEE_AMOUNT
  } else {
    const decimalAdjustment = tokenDecimals / 6
    feeReserveAmount = BN(MIN_FEE_AMOUNT).multipliedBy(decimalAdjustment).toFixed(0)
  }

  if (maxAmount.isLessThanOrEqualTo(feeReserveAmount)) {
    return maxAmount.multipliedBy(0.1).integerValue()
  }

  return maxAmount.minus(feeReserveAmount).integerValue()
}

export function getCurrentFeeToken(chainConfig: ChainConfig): NetworkCurrency {
  try {
    const savedToken = localStorage.getItem(`${chainConfig.id}/${LocalStorageKeys.MARS_FEE_TOKEN}`)
    if (savedToken) {
      return JSON.parse(savedToken) as NetworkCurrency
    }
  } catch (error) {
    console.error('Failed to get fee token from localStorage:', error)
  }
  return chainConfig.defaultCurrency
}
