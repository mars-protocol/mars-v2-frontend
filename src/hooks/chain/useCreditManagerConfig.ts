import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import useSWR from 'swr'
import { getUrl } from 'utils/url'
import useStore from 'store'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import chains from 'chains'

export default function useCreditManagerConfig() {
  const chainId = getCurrentChainId()
  const baseConfig = chains[chainId]

  return useSWR(
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
}
