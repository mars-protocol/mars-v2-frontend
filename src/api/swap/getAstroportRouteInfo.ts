import { FETCH_TIMEOUT } from 'constants/query'
import { byDenom } from 'utils/array'
import { fetchWithTimeout } from 'utils/fetch'
import { BN } from 'utils/helpers'

export default async function getRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
  adjustedSwapFee?: number,
): Promise<SwapRouteInfo | null> {
  const astroportUrl = `${chainConfig.endpoints.routes}?start=${denomIn}&end=${denomOut}&amount=${amount.toString()}&chainId=${chainConfig.id}&limit=1`
  const swapFee = adjustedSwapFee ?? chainConfig.swapFee

  try {
    const resp = await fetchWithTimeout(astroportUrl, FETCH_TIMEOUT)
    const route = (await resp.json())[0] as AstroportRouteResponse

    let amountOut = BN(route.amount_out)
    if (!amountOut.gt(0))
      amountOut = amountOut.times(1 - swapFee).integerValue(BigNumber.ROUND_FLOOR)

    return {
      amountOut,
      priceImpact: BN(route.price_impact),
      fee: BN(0), // TODO: Fees are not implemented yet on Astroport endpoint
      description: [
        assets.find(byDenom(denomIn))?.symbol,
        ...route.swaps.map((swap) => assets.find(byDenom(swap.to))?.symbol),
      ].join(' -> '),
      route: {
        astro: {
          swaps: route.swaps.map((swap) => ({
            from: swap.from,
            to: swap.to,
          })),
        },
      },
    }
  } catch (e) {
    return null
  }
}
