import { BN_ZERO } from 'constants/math'
import { ChainInfoID } from 'types/enums'
import { BN } from 'utils/helpers'

export default async function estimateExactIn(
  chainConfig: ChainConfig,
  coinIn: Coin,
  denomOut: string,
) {
  const isOsmosis = [ChainInfoID.Osmosis1].includes(chainConfig.id)
  const osmosisFetchOptions = {
    method: 'GET',
    headers: {
      'X-API-KEY': process.env.NEXT_PUBLIC_SQS_API_KEY ?? '',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }

  try {
    if (isOsmosis) {
      const url = `${chainConfig.endpoints.routes}/quote?tokenIn=${coinIn.amount}${coinIn.denom}&tokenOutDenom=${denomOut}`
      const resp = await fetch(url, osmosisFetchOptions)
      const route = (await resp.json()) as OsmosisRouteResponse

      return BN(route.amount_out)
    } else {
      const url = `${chainConfig.endpoints.routes}?start=${coinIn.denom}&end=${denomOut}&amount=${coinIn.amount}&chainId=${chainConfig.id}&limit=1`
      const resp = await fetch(url)
      const route = (await resp.json())[0] as AstroportRouteResponse

      return BN(route.amount_out)
    }
  } catch (ex) {
    return BN_ZERO
  }
}
