import chains from 'chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import useSWR from 'swr'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { getUrl } from 'utils/url'
import useStore from 'store'

export default function useChainConfig() {
  const chainId = getCurrentChainId()
  const baseConfig = chains[chainId]

  const { data: creditManagerConfig } = useSWR(
    baseConfig.contracts.creditManager && `chains/${chainId}/creditManager/config`,
    async () => {
      const client = await CosmWasmClient.connect(getUrl(baseConfig.endpoints.rpc))
      const config = await client.queryContractSmart(baseConfig.contracts.creditManager, {
        config: {},
      })

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
      })

      return config
    },
    {
      suspense: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  const rpcEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.RPC_ENDPOINT}`) ?? baseConfig.endpoints.rpc
  const restEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.REST_ENDPOINT}`) ??
    baseConfig.endpoints.rest

  return {
    ...baseConfig,
    endpoints: {
      ...baseConfig.endpoints,
      rpc: rpcEndpoint,
      rest: restEndpoint,
    },
    contracts: creditManagerConfig
      ? {
          ...baseConfig.contracts,
          accountNft: creditManagerConfig.account_nft,
          oracle: creditManagerConfig.oracle,
          params: creditManagerConfig.params,
          redBank: creditManagerConfig.red_bank,
          incentives: creditManagerConfig.incentives,
          perps: creditManagerConfig.perps,
        }
      : baseConfig.contracts,
  }
}
