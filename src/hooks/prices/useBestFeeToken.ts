import { useMemo } from 'react'
import { NetworkCurrency } from '@delphi-labs/shuttle'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import usePrices from 'hooks/prices/usePrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { findBestFeeToken } from 'utils/feeToken'
import useAssets from 'hooks/assets/useAssets'

export default function useBestFeeToken(): NetworkCurrency | undefined {
  const address = useStore((s) => s?.address) || ''
  const { data: walletBalances } = useWalletBalances(address)
  const { data: pricesData } = usePrices()
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  return useMemo(() => {
    if (!address || !walletBalances) return undefined

    const usdcDenom = chainConfig.stables[0]
    const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom

    return findBestFeeToken(walletBalances, usdcDenom, nativeDenom, assets)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletBalances, pricesData, chainConfig, address, assets])
}
