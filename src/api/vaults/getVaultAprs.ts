import { aprsCache, aprsCacheResponse, cacheFn } from 'api/cache'

export default async function getAprs(chainConfig: ChainConfig) {
  try {
    const response = await cacheFn(
      () => fetch(chainConfig.endpoints.aprs.vaults),
      aprsCacheResponse,
      'aprsResponse',
      60,
    )

    if (response.ok) {
      const data: AprResponse = await cacheFn(() => response.json(), aprsCache, 'aprs', 60)

      return data.vaults.map((aprData) => {
        const finalApr = aprData.apr.projected_apr * 100
        return { address: aprData.address, apr: finalApr } as Apr
      })
    }

    return []
  } catch {
    return []
  }
}
