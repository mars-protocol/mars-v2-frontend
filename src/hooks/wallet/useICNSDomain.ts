import useSWR from 'swr'

import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { ChainInfoID } from 'types/enums/wallet'

export default function useICNSDomain(address?: string) {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const enabled = !!clients && chainConfig.id === ChainInfoID.Osmosis1 && address

  return useSWR(
    enabled && `chains/${chainConfig.id}/${address}/icns`,
    () => clients!.icns.primaryName({ address: address! }),
    {
      revalidateOnFocus: false,
    },
  )
}
