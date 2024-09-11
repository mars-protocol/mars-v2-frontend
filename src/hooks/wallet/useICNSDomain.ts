import useSWR from 'swr'

import useChainConfig from 'chain/useChainConfig'
import useClients from 'chain/useClients'

export default function useICNSDomain(address?: string) {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const enabled = !!clients && chainConfig.isOsmosis && address

  return useSWR(
    enabled && `chains/${chainConfig.id}/${address}/icns`,
    () => clients!.icns.primaryName({ address: address! }),
    {
      revalidateOnFocus: false,
    },
  )
}
