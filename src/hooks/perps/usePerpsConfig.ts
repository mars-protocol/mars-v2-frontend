import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import useSWR from 'swr'

export default function usePerpsConfig() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/config`, async () =>
    clients?.perps.config(),
  )
}
