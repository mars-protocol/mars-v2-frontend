import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import { ChainInfoID } from 'types/enums/wallet'
import { BN } from 'utils/helpers'

export default function useRoutes(denomIn: string, denomOut: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet].includes(chainConfig.id)

  const osmosisRoute = useSWR<SwapRouteInfo | null>(
    isOsmosis &&
      `${chainConfig.endpoints.routes}/quote?tokenIn=${denomIn}&tokenOutDenom=${denomOut}&amount=${amount}`,
    async (url: string) => {
      try {
        const resp = await fetch(url)
        const route = (await resp.json()) as OsmosisRouteResponse

        return {
          priceImpact: BN(route.price_impact),
          fee: BN(route.effective_fee),
          route: {
            osmo: {
              swaps: route.route[0].pools.map((pool) => ({
                pool_id: pool.id.toString(),
                to: pool.token_out_denom,
              })),
            },
          },
        }
      } catch {
        return null
      }
    },
  )

  const astroportRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis &&
      `${chainConfig.endpoints.routes}?start=${denomIn}&end=${denomOut}&amount=${amount}&chainId=${chainConfig.id}&limit=1`,
    async (url: string) => {
      try {
        const resp = await fetch(url)
        const route = (await resp.json())[0] as AstroportRouteResponse

        return {
          priceImpact: BN(route.price_impact),
          fee: BN(0), // TODO: Fees are not implemented yet on Astroport endpoint
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
    },
  )

  if (isOsmosis) return osmosisRoute

  return astroportRoute
}
