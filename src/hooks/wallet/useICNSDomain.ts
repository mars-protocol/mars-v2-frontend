import useSWR from 'swr'

import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'

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
