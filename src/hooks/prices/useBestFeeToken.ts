import { useMemo } from 'react'
import { NetworkCurrency } from '@delphi-labs/shuttle'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import usePrices from 'hooks/prices/usePrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { findBestFeeToken } from 'utils/feeToken'

export default function useBestFeeToken(): NetworkCurrency | undefined {
  const address = useStore((s) => s?.address) || ''
  const { data: walletBalances } = useWalletBalances(address)
  const { data: pricesData } = usePrices()
  const chainConfig = useChainConfig()

  return useMemo(() => {
    if (!address || !walletBalances) return undefined

    const usdcDenom = chainConfig.stables[0]
    const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom

    return findBestFeeToken(walletBalances, usdcDenom, nativeDenom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletBalances, pricesData, chainConfig, address])
}
