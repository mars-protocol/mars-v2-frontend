import { getSwapperQueryClient } from 'api/cosmwasm-client'

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
