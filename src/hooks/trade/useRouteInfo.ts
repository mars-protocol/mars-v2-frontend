import useSWR from 'swr'

import getNeutronRouteInfo from 'api/swap/getNeutronRouteInfo'
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
