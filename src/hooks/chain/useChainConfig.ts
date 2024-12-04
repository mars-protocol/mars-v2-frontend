import chains from 'chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getCurrentChainId } from 'utils/getCurrentChainId'
import useCreditManagerConfig from 'hooks/chain/useCreditManagerConfig'

export default function useChainConfig(): ChainConfig {
  const chainId = getCurrentChainId()
  const baseConfig = chains[chainId]
  const { data: creditManagerConfig, error } = useCreditManagerConfig()

  const rpcEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.RPC_ENDPOINT}`) ?? baseConfig.endpoints.rpc
  const restEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.REST_ENDPOINT}`) ??
    baseConfig.endpoints.rest

  if (error || !creditManagerConfig) {
    return {
      ...baseConfig,
      endpoints: {
        ...baseConfig.endpoints,
        rpc: rpcEndpoint,
        rest: restEndpoint,
      },
    }
  }

  return {
    ...baseConfig,
    endpoints: {
      ...baseConfig.endpoints,
      rpc: rpcEndpoint,
      rest: restEndpoint,
    },
  }
}
