import { route as skipRoute } from '@skip-go/client'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default async function getNeutronRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
): Promise<SwapRouteInfo | null> {
  try {
    const skipRouteResponse = await skipRoute({
      amountIn: amount.toString(),
      sourceAssetDenom: denomIn,
      sourceAssetChainId: chainConfig.id,
      destAssetDenom: denomOut,
      destAssetChainId: chainConfig.id,
      swapVenues: [{ chainId: chainConfig.id }],
    })

    if (!skipRouteResponse) return null

    return {
      amountOut: BN(skipRouteResponse.amountOut || '0'),
      priceImpact: BN('0'), // Skip doesn't provide price impact in the same format
      fee: BN('0'), // Skip fees are calculated differently
      description: [
        assets.find(byDenom(denomIn))?.symbol || denomIn,
        assets.find(byDenom(denomOut))?.symbol || denomOut,
      ].join(' -> '),
      route: {
        astro: {
          swaps: [
            {
              from: denomIn,
              to: denomOut,
            },
          ],
        },
      },
    } as SwapRouteInfo
  } catch {
    return null
  }
}
