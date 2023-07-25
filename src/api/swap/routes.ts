import { getSwapperQueryClient } from 'api/cosmwasm-client'

interface RouteResponse {
  pool_id: string
  token_out_denom: string
}

export default async function getRoutes(
  denomIn: string,
  denomOut: string,
): Promise<RouteResponse[]> {
  try {
    const swapperClient = await getSwapperQueryClient()
    const routes = await swapperClient.route({
      denomIn,
      denomOut,
    })
    return routes.route as unknown as RouteResponse[]
  } catch (ex) {
    return []
  }
}
