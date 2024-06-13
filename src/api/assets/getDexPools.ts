import { convertAstroportPoolResponse } from 'utils/assets'

export default async function getDexPools(chainConfig: ChainConfig) {
  if (!chainConfig.endpoints.dexPools) return []
  const uri = new URL(chainConfig.endpoints.dexPools)
  try {
    const assets = await fetch(uri.toString()).then(async (res) => {
      const data = (await res.json()) as AstroportPool[]
      return convertAstroportPoolResponse(data)
    })
    return assets
  } catch (e) {
    console.error(e)
  }
  return []
}
