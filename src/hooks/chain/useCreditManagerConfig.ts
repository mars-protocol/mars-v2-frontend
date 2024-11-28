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

        if (!config.account_nft || !config.oracle || !config.params || !config.red_bank) {
          const error = new Error('Credit manager config missing required fields')
          setNodeError(getUrl(baseConfig.endpoints.rpc), error.message)
          throw error
        }

        useStore.setState({
          creditManagerConfig: {
            ...config,
            credit_manager_contract_addr: baseConfig.contracts.creditManager,
            account_nft: config.account_nft,
            oracle: config.oracle,
            params: config.params,
            red_bank: config.red_bank,
            incentives: config.incentives,
            perps: config.perps,
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
      suspense: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: false,
    },
  )
}
