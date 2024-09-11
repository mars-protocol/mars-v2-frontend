import chains from 'chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getCurrentChainId } from 'utils/getCurrentChainId'

export default function useChainConfig() {
  const chainId = getCurrentChainId()

  const rpcEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.RPC_ENDPOINT}`) ??
    chains[chainId].endpoints.rpc
  const restEndpoint =
    localStorage.getItem(`${chainId}/${LocalStorageKeys.REST_ENDPOINT}`) ??
    chains[chainId].endpoints.rest

  return {
    ...chains[chainId],
    endpoints: {
      ...chains[chainId].endpoints,
      rpc: rpcEndpoint,
      rest: restEndpoint,
    },
  }
}
