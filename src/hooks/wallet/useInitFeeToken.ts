import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useGasPrices from 'hooks/prices/useGasPrices'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useMemo } from 'react'
import useStore from 'store'
import { getAvailableFeeTokens } from 'utils/feeToken'
import { BN } from 'utils/helpers'

export function setFeeToken(token: NetworkCurrency, chainConfigId: ChainConfig['id']) {
  try {
    localStorage.setItem(
      `${chainConfigId}/${LocalStorageKeys.MARS_FEE_TOKEN}`,
      JSON.stringify(token),
    )
  } catch (error) {
    console.error('Failed to save fee token to localStorage:', error)
  }
}

export function getFeeToken(chainConfigId: ChainConfig['id']) {
  const savedToken: string | null = localStorage.getItem(
    `${chainConfigId}/${LocalStorageKeys.MARS_FEE_TOKEN}`,
  )
  if (!savedToken) return
  return JSON.parse(savedToken) as NetworkCurrency
}

export default function useInitFeeToken() {
  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances, isLoading: isLoadingBalances } = useWalletBalances(walletAddress)
  const { data: assets } = useAssets()
  const { data: gasPrices } = useGasPrices()
  const chainConfig = useChainConfig()

  const availableFeeTokens = useMemo(() => {
    if (!gasPrices || !walletBalances) return []
    return getAvailableFeeTokens(walletBalances, gasPrices?.prices, chainConfig, assets)
  }, [assets, chainConfig, gasPrices, walletBalances])

  return useMemo(() => {
    // Don't do anything without a wallet address
    if (!walletAddress) return false

    // Wait for data to be loaded
    if (isLoadingBalances || walletBalances === undefined || gasPrices === undefined) return false

    // Helper function to check token balance
    const hasTokenBalance = (denom: string) => {
      const balance = walletBalances.find((coin) => coin.denom === denom)
      const hasBalance = balance && BN(balance.amount).isGreaterThan(0)

      return hasBalance
    }

    // Helper functions for identifying token types
    const isStableToken = (denom: string) => chainConfig.stables.includes(denom)
    const isNativeToken = (denom: string) => denom === chainConfig.defaultCurrency.coinMinimalDenom

    // Helper functions for setting tokens with priority
    const trySetNativeToken = () => {
      const nativeToken = chainConfig.defaultCurrency
      if (hasTokenBalance(nativeToken.coinMinimalDenom)) {
        setFeeToken(nativeToken, chainConfig.id)
        return true
      }
      return false
    }

    const trySetStableToken = () => {
      // Filter available tokens for stable tokens with balance
      const stableTokens = availableFeeTokens.filter((t) => isStableToken(t.token.coinMinimalDenom))

      if (stableTokens.length > 0) {
        setFeeToken(stableTokens[0].token, chainConfig.id)
        return true
      }
      return false
    }

    const trySetOtherToken = () => {
      // Filter for tokens that are not native and not stable but have balance
      const otherTokens = availableFeeTokens.filter(
        (t) => !isNativeToken(t.token.coinMinimalDenom) && !isStableToken(t.token.coinMinimalDenom),
      )

      if (otherTokens.length > 0) {
        setFeeToken(otherTokens[0].token, chainConfig.id)
        return true
      }
      return false
    }

    // Get current fee token
    const feeToken = getFeeToken(chainConfig.id)

    // Check if any token can be used as fee token
    const hasAnyFeeToken = availableFeeTokens.length > 0

    // Case 1: No fee token set but we have balances
    if (!feeToken && hasAnyFeeToken) {
      return (
        trySetNativeToken() ||
        trySetStableToken() ||
        trySetOtherToken() ||
        (setFeeToken(chainConfig.defaultCurrency, chainConfig.id), true)
      )
    }

    // Case 2: Fee token set but it no longer has balance
    if (feeToken && !hasTokenBalance(feeToken.coinMinimalDenom) && hasAnyFeeToken) {
      return (
        trySetNativeToken() ||
        trySetStableToken() ||
        trySetOtherToken() ||
        (setFeeToken(chainConfig.defaultCurrency, chainConfig.id), true)
      )
    }

    // Case 3: Fee token set and has balance but gas price has changed
    if (feeToken && hasTokenBalance(feeToken.coinMinimalDenom) && hasAnyFeeToken) {
      // Find the current gas price from the fetched gas prices
      const currentGasPrice = gasPrices.prices.find(
        (price) => price.denom === feeToken.coinMinimalDenom,
      )

      // If we have a current gas price and it's different from the stored one
      if (currentGasPrice) {
        const storedGasPrice = feeToken.gasPriceStep.average.toString()
        const fetchedGasPrice = BN(currentGasPrice.amount)
          .decimalPlaces(feeToken.coinDecimals)
          .toString()

        // If gas price has changed, update the fee token with the new price
        if (storedGasPrice !== fetchedGasPrice) {
          // Find the updated token from available fee tokens
          const updatedToken = availableFeeTokens.find(
            (t) => t.token.coinMinimalDenom === feeToken.coinMinimalDenom,
          )

          if (updatedToken) {
            setFeeToken(updatedToken.token, chainConfig.id)
            return true
          }
        }
      }
    }

    // No changes needed
    return true
  }, [availableFeeTokens, chainConfig, gasPrices, isLoadingBalances, walletAddress, walletBalances])
}
