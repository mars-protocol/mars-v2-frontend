import { FETCH_TIMEOUT } from 'constants/query'
import { byDenom } from 'utils/array'
import { fetchWithTimeout } from 'utils/fetch'
import { BN } from 'utils/helpers'

export default async function getRouteInfo(
  url: string,
  denomIn: string,
  assets: Asset[],
  isOsmosis: boolean,
): Promise<SwapRouteInfo | null> {
  if (isOsmosis) {
    try {
      const resp = await fetchWithTimeout(url, FETCH_TIMEOUT)
      const route = (await resp.json()) as OsmosisRouteResponse

      return {
        amountOut: BN(route.amount_out),
        priceImpact: BN(route.price_impact).times(100),
        fee: BN(route.effective_fee),
        description: [
          assets.find(byDenom(denomIn))?.symbol,
          ...route.route[0].pools.map(
            (pool) => assets.find(byDenom(pool.token_out_denom))?.symbol ?? '...',
          ),
        ].join(' -> '),
        route: {
          osmo: {
            swaps: route.route[0].pools.map(
              (pool) =>
                ({
                  pool_id: pool.id,
                  to: pool.token_out_denom,
                }) as unknown,
            ),
          },
        },
      } as SwapRouteInfo
    } catch {
      return null
    }
  } else {
    try {
      const resp = await fetchWithTimeout(url, FETCH_TIMEOUT)
      const route = (await resp.json())[0] as AstroportRouteResponse

      return {
        amountOut: BN(route.amount_out),
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
}
