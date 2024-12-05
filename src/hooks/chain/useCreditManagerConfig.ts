import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import useSWRImmutable from 'swr/immutable'
import { getUrl } from 'utils/url'
import useStore from 'store'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import chains from 'chains'
import { setNodeError } from 'utils/error'

export default function useCreditManagerConfig() {
  const chainId = getCurrentChainId()
  const baseConfig = chains[chainId]

  if (!baseConfig.contracts.creditManager) {
    throw new Error('Credit manager contract address is required')
  }

  return useSWRImmutable(
    baseConfig.contracts.creditManager && `chains/${chainId}/creditManager/config`,
    async () => {
      try {
        const client = await CosmWasmClient.connect(getUrl(baseConfig.endpoints.rpc))
        const config = await client.queryContractSmart(baseConfig.contracts.creditManager, {
          config: {},
        })

        useStore.setState({
          creditManagerConfig: {
            ...config,
          },
          errorStore: { nodeError: null, apiError: null },
        })

        return config
      } catch (ex) {
        const error = ex instanceof Error ? ex : new Error('Unknown Error')
        setNodeError(getUrl(baseConfig.endpoints.rpc), error.message)
        throw error
      }
    },
    {
      suspense: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: false,
    },
  )
}
