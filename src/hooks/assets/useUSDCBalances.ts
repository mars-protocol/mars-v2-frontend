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

  const isTestnet = chainConfig.id === 'pion-1'
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address || isConnecting) return

      try {
        const balances = await fetchUSDCBalances(address)
        const usdcAssets = Object.entries(balances).map(([chainId, balance]) =>
          WrappedBNCoin.fromDenomAndBigNumber(
            isTestnet
              ? 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42'
              : 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
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
  }, [address, isConnected, isConnecting, walletBalances, isTestnet])

  return useMemo(() => ({ usdcBalances }), [usdcBalances])
}
