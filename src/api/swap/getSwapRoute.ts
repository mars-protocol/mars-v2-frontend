import { getSwapperQueryClient } from 'api/cosmwasm-client'

interface Route {
  pool_id: string
  token_out_denom: string
}

export default async function getSwapRoute(denomIn: string, denomOut: string): Promise<Route[]> {
  try {
    const swapperClient = await getSwapperQueryClient()
    const routes = await swapperClient.route({
      denomIn,
      denomOut,
    })

    return routes.route as unknown as Route[]
  } catch (ex) {
    return []
  }
}
