import useSWR from 'swr'

import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDebounce from 'hooks/common/useDebounce'
import { ChainInfoID } from 'types/enums'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default function useRouteInfo(denomIn: string, denomOut: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const isOsmosis = [ChainInfoID.Osmosis1].includes(chainConfig.id)
  const { data: assets } = useAssets()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)

  const osmosisRoute = useSWR<SwapRouteInfo | null>(
    isOsmosis &&
      debouncedAmount !== '0' &&
      `${chainConfig.endpoints.routes}/quote?tokenIn=${debouncedAmount}${denomIn}&tokenOutDenom=${denomOut}`,
    async (url: string) => {
      try {
        const resp = await fetch(url)
        const route = (await resp.json()) as OsmosisRouteResponse

        return {
          amountOut: BN(route.amount_out),
          priceImpact: BN(route.price_impact),
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
    },
  )

  const astroportRoute = useSWR<SwapRouteInfo | null>(
    !isOsmosis &&
      `${chainConfig.endpoints.routes}?start=${denomIn}&end=${denomOut}&amount=${debouncedAmount}&chainId=${chainConfig.id}&limit=1`,
    async (url: string) => {
      try {
        const resp = await fetch(url)
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
    },
  )

  if (isOsmosis) return osmosisRoute

  return astroportRoute
}
