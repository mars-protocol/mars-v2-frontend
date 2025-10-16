import useSWR from 'swr'

import getNeutronRouteInfo, { getNeutronRouteInfoReverse } from 'api/swap/getNeutronRouteInfo'
import getOsmosisRouteInfo from 'api/swap/getOsmosisRouteInfo'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDebounce from 'hooks/common/useDebounce'
import useAdjustedSwapFee from 'hooks/staking/useAdjustedSwapFee'

export default function useRouteInfo(denomIn: string, denomOut: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis
  const { data: assets } = useAssets()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)
  const adjustedSwapFee = useAdjustedSwapFee(chainConfig.swapFee)

  const neutronRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis && debouncedAmount !== '0' && assets && amount.gt(0)
      ? ['route', denomIn, denomOut, debouncedAmount, chainConfig.id, adjustedSwapFee]
      : null,
    async () =>
      getNeutronRouteInfo(denomIn, denomOut, amount, assets, chainConfig, adjustedSwapFee),
  )

  const osmosisUrl = `${chainConfig.endpoints.routes}/quote?tokenIn=${debouncedAmount}${denomIn}&tokenOutDenom=${denomOut}`

  const osmosisRoute = useSWR<SwapRouteInfo | null>(
    isOsmosis && debouncedAmount !== '0' && osmosisUrl
      ? ['route', denomIn, denomOut, debouncedAmount, chainConfig.id, adjustedSwapFee]
      : null,
    async () => getOsmosisRouteInfo(osmosisUrl, denomIn, assets, chainConfig, adjustedSwapFee),
  )

  return isOsmosis ? osmosisRoute : neutronRoute
}

/**
 * Hook for reverse routing - specify the amount out to get the required amount in
 * Specifically designed for HLS debt repayment scenarios where we need to know
 * how much collateral to swap to get an exact debt amount
 */
export function useRouteInfoReverse(
  denomIn: string,
  denomOut: string,
  amountOut: BigNumber,
  slippage?: number,
) {
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis
  const { data: assets } = useAssets()
  const defaultSettings = getDefaultChainSettings(chainConfig)
  const effectiveSlippage = slippage ?? defaultSettings.slippage
  const debouncedAmount = useDebounce<string>(amountOut.toString(), 500)
  const adjustedSwapFee = useAdjustedSwapFee(chainConfig.swapFee)

  // For now, only support reverse routing on Neutron with Skip routes
  // Osmosis reverse routing would need additional implementation
  const neutronReverseRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis && debouncedAmount !== '0' && assets && amountOut.gt(0)
      ? [
          'reverse-route',
          denomIn,
          denomOut,
          debouncedAmount,
          effectiveSlippage,
          chainConfig.id,
          adjustedSwapFee,
        ]
      : null,
    async () =>
      getNeutronRouteInfoReverse(
        denomIn,
        denomOut,
        amountOut,
        assets,
        chainConfig,
        effectiveSlippage,
        adjustedSwapFee,
      ),
  )

  // Return null for Osmosis as reverse routing is not implemented yet
  if (isOsmosis) {
    return { data: null, error: null, isLoading: false }
  }

  return neutronReverseRoute
}
