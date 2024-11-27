import chains from 'chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import useCreditManagerConfig from 'hooks/chain/useCreditManagerConfig'

export default function useChainConfig() {
  const chainId = getCurrentChainId()
  const baseConfig = chains[chainId]
  const { data: creditManagerConfig } = useCreditManagerConfig()

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
