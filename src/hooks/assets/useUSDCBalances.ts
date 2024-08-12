import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { CHAIN_NAMES, fetchUSDCBalances } from 'utils/fetchUSDCBalance'
import useStore from 'store'

export function useUSDCBalances(walletBalances: any[]) {
  const [usdcBalances, setUsdcBalances] = useState<
    { denom: string; amount: string; chainName: string }[]
  >([])
  const { isConnecting, isConnected, address } = useAccount()

  useEffect(() => {
    const fetchBalances = async () => {
      if (isConnected && address && !isConnecting) {
        try {
          const balances = await fetchUSDCBalances(address)
          const usdcAssets = Object.entries(balances).map(([chainId, balance]) => ({
            denom: `ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42`,
            amount: (Number(balance) * 10 ** 6).toString(),
            chainName: `${CHAIN_NAMES[Number(chainId)]}`,
          }))

          setUsdcBalances(usdcAssets)
          const combinedBalances = [
            ...walletBalances,
            ...usdcAssets.map((asset) => ({
              denom: asset.denom,
              amount: asset.amount,
              chainName: asset.chainName,
            })),
          ]
          useStore.setState({ balances: combinedBalances })
        } catch (error) {
          console.error('Error fetching USDC balances:', error)
        }
      }
    }

    fetchBalances()
  }, [address, isConnected, isConnecting, walletBalances])

  return { usdcBalances }
}
