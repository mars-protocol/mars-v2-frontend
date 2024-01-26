import useSWR from 'swr'

import getWalletBalances from 'api/wallets/getWalletBalances'
import useChainConfig from 'hooks/useChainConfig'

export default function useWalletBalances(address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    address && `chains/${chainConfig.id}/wallets/${address}/balances`,
    () => getWalletBalances(chainConfig, address || ''),
    {
      isPaused: () => !address,
      fallbackData: [],
    },
  )
}
