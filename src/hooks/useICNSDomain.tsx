import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import { ChainInfoID } from 'types/enums/wallet'

import useClients from './useClients'

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
