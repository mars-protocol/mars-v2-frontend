import { getSwapperQueryClient } from 'api/cosmwasm-client'

export default async function getSwapRoute(
  chainConfig: ChainConfig,
  denomIn: string,
  denomOut: string,
): Promise<Route[]> {
  try {
    const swapperClient = await getSwapperQueryClient(chainConfig)
    const routes = await swapperClient.route({
      denomIn,
      denomOut,
    })

    return routes.route as unknown as Route[]
  } catch (ex) {
    return []
  }
}
