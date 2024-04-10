import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

export default function usePerpsConfig() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `${chainConfig.id}/perps/config`, async () => {
    return await clients?.perps.config()
  })
}
