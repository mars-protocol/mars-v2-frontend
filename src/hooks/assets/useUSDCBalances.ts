import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { CHAIN_NAMES, fetchUSDCBalances } from 'utils/fetchUSDCBalance'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { BN } from 'utils/helpers'
import useChainConfig from 'hooks/chain/useChainConfig'

export function useUSDCBalances(walletBalances: any[]) {
  const [usdcBalances, setUsdcBalances] = useState<WrappedBNCoin[]>([])
  const { isConnecting, isConnected, address } = useAccount()
  const chainConfig = useChainConfig()

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address || isConnecting) return

      try {
        const balances = await fetchUSDCBalances(address)
        const usdcAssets = Object.entries(balances).map(([chainId, balance]) =>
          WrappedBNCoin.fromDenomAndBigNumber(
            chainConfig.stables[0],
            BN(balance).shiftedBy(6),
            CHAIN_NAMES[Number(chainId)],
          ),
        )

        setUsdcBalances(usdcAssets)
        const combinedBalances = [
          ...walletBalances,
          ...usdcAssets.map((wrappedCoin) => wrappedCoin.toCoin()),
        ]
        useStore.setState({ balances: combinedBalances })
      } catch (error) {
        console.error('Error fetching USDC balances:', error)
      }
    }

    fetchBalances()
  }, [address, isConnected, isConnecting, walletBalances, chainConfig.stables])

  return useMemo(() => ({ usdcBalances }), [usdcBalances])
}
