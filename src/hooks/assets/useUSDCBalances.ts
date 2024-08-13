import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { CHAIN_NAMES, fetchUSDCBalances } from 'utils/fetchUSDCBalance'
import useStore from 'store'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

export function useUSDCBalances(walletBalances: any[]) {
  const [usdcBalances, setUsdcBalances] = useState<WrappedBNCoin[]>([])
  const { isConnecting, isConnected, address } = useAccount()

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address || isConnecting) return

      try {
        const balances = await fetchUSDCBalances(address)
        const usdcAssets = Object.entries(balances).map(([chainId, balance]) =>
          WrappedBNCoin.fromCoin(
            {
              denom: `ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42`,
              amount: (Number(balance) * 10 ** 6).toString(),
            },
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
  }, [address, isConnected, isConnecting, walletBalances])

  return useMemo(() => ({ usdcBalances }), [usdcBalances])
}
