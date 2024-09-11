import useSWR from 'swr'

import useChainConfig from 'chain/useChainConfig'
import { getUrl } from 'utils/url'

export default function useWalletBalances(address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    address && `chains/${chainConfig.id}/wallets/${address}/balances`,
    () => getWalletBalances(chainConfig, address!),
    {
      isPaused: () => !address,
      fallbackData: [],
    },
  )
}

async function getWalletBalances(chainConfig: ChainConfig, address: string): Promise<Coin[]> {
  const uri = getUrl(chainConfig.endpoints.rest, `cosmos/bank/v1beta1/balances/${address}`)

  const response = await fetch(uri)

  if (response.ok) {
    const data = await response.json()
    return data.balances
  }

  return new Promise((_, reject) => reject('No data'))
}
