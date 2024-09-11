import useSWR from 'swr'

import getRouteInfo from 'api/swap/getRouteInfo'
import useDebounce from 'hooks/common/useDebounce'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useRouteInfo(denomIn: string, denomOut: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis
  const { data: assets } = useAssets()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)

  const osmosisUrl = `${chainConfig.endpoints.routes}/quote?tokenIn=${debouncedAmount}${denomIn}&tokenOutDenom=${denomOut}`
  const astroportUrl = `${chainConfig.endpoints.routes}?start=${denomIn}&end=${denomOut}&amount=${debouncedAmount}&chainId=${chainConfig.id}&limit=1`

  const osmosisRoute = useSWR<SwapRouteInfo | null>(
    isOsmosis && debouncedAmount !== '0' && osmosisUrl,
    async () => getRouteInfo(osmosisUrl, denomIn, assets, true),
  )
  const astroportRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis && debouncedAmount !== '0' && astroportUrl,
    async () => getRouteInfo(astroportUrl, denomIn, assets, false),
  )

  if (isOsmosis) return osmosisRoute

  return astroportRoute
}
