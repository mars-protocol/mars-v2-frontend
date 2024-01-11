import { aprsCache, aprsCacheResponse, cacheFn } from 'api/cache'

export default async function getAprs(chainConfig: ChainConfig) {
  try {
    const response = await cacheFn(
      () => fetch(chainConfig.endpoints.aprs.vaults),
      aprsCacheResponse,
      `${chainConfig.id}/aprsResponse`,
      60,
    )

    if (response.ok) {
      const data: AprResponse = await cacheFn(
        () => response.json(),
        aprsCache,
        `${chainConfig.id}/aprs`,
        60,
      )

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
