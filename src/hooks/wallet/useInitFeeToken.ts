import { NetworkCurrency } from '@delphi-labs/shuttle'
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
  const { data: walletBalances } = useWalletBalances(walletAddress)
  const { data: assets } = useAssets()
  const { data: gasPricesData } = useGasPrices()
  const chainConfig = useChainConfig()
  const availableFeeTokens = useMemo(() => {
    if (!gasPricesData) return []
    return getAvailableFeeTokens(walletBalances, gasPricesData?.prices, chainConfig, assets)
  }, [assets, chainConfig, gasPricesData, walletBalances])

  return useMemo(() => {
    if (!gasPricesData || !walletAddress) return false
    if (availableFeeTokens.length === 0) {
      const stableToken = getAvailableFeeTokens(
        walletBalances,
        gasPricesData?.prices,
        chainConfig,
        assets,
        true,
      )[0]?.token
      if (stableToken) {
        setFeeToken(stableToken, chainConfig.id)
        return true
      }
    }

    const feeToken = getFeeToken(chainConfig.id)
    if (!feeToken) {
      setFeeToken(availableFeeTokens[0].token, chainConfig.id)
      return true
    }

    const currentToken = availableFeeTokens.find(
      (token) => token.token.coinMinimalDenom === feeToken.coinMinimalDenom,
    )?.token

    const currentTokenBalance = walletBalances.find(
      (coin) => coin.denom === feeToken.coinMinimalDenom,
    )

    if (
      !currentToken ||
      !currentTokenBalance ||
      BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)
    ) {
      if (availableFeeTokens.length > 0) {
        setFeeToken(availableFeeTokens[0].token, chainConfig.id)
        return true
      }
    }

    if (
      currentToken.coinMinimalDenom !== feeToken.coinMinimalDenom ||
      currentToken.gasPriceStep?.average !== feeToken.gasPriceStep?.average
    ) {
      setFeeToken(currentToken, chainConfig.id)
      return true
    }

    return !!feeToken
  }, [assets, availableFeeTokens, chainConfig, gasPricesData, walletAddress, walletBalances])
}
