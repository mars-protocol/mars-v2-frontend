import useSWR from 'swr'

import getNeutronRouteInfo, { getNeutronRouteInfoReverse } from 'api/swap/getNeutronRouteInfo'
import getOsmosisRouteInfo from 'api/swap/getOsmosisRouteInfo'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDebounce from 'hooks/common/useDebounce'

export default function useRouteInfo(denomIn: string, denomOut: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis
  const { data: assets } = useAssets()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)

  const osmosisUrl = `${chainConfig.endpoints.routes}/quote?tokenIn=${debouncedAmount}${denomIn}&tokenOutDenom=${denomOut}`

  const osmosisRoute = useSWR<SwapRouteInfo | null>(
    isOsmosis && debouncedAmount !== '0' && osmosisUrl,
    async () => getOsmosisRouteInfo(osmosisUrl, denomIn, assets),
  )
  const neutronRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis && debouncedAmount !== '0' && assets,
    async () => getNeutronRouteInfo(denomIn, denomOut, amount, assets, chainConfig),
  )

  if (isOsmosis) return osmosisRoute

  return neutronRoute
}

/**
 * Hook for reverse routing - specify the minimum amount out to get the required amount in
 * Specifically designed for HLS debt repayment scenarios where we need to know
 * how much collateral to swap to get an exact debt amount
 */
export function useRouteInfoReverse(denomIn: string, denomOut: string, minAmountOut: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis
  const { data: assets } = useAssets()
  const debouncedAmount = useDebounce<string>(minAmountOut.toString(), 500)

  // For now, only support reverse routing on Neutron with Skip routes
  // Osmosis reverse routing would need additional implementation
  const neutronReverseRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis && debouncedAmount !== '0' && assets && minAmountOut.gt(0)
      ? ['reverse-route', denomIn, denomOut, debouncedAmount, chainConfig.id]
      : null,
    async () => getNeutronRouteInfoReverse(denomIn, denomOut, minAmountOut, assets, chainConfig),
  )

  // Return null for Osmosis as reverse routing is not implemented yet
  if (isOsmosis) {
    return { data: null, error: null, isLoading: false }
  }

  return neutronReverseRoute
}
