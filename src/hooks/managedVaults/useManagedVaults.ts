import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()

  return useSWR(`chains/${chainConfig.id}/managedVaults`, () => getManagedVaults(chainConfig), {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
