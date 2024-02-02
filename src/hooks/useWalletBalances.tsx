import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'

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
  const uri = '/cosmos/bank/v1beta1/balances/'

  const response = await fetch(
    `${chainConfig.endpoints.rest}${uri}${address}?x-apikey=${process.env.NEXT_PUBLIC_API_KEY}`,
  )

  if (response.ok) {
    const data = await response.json()
    return data.balances
  }

  return new Promise((_, reject) => reject('No data'))
}
