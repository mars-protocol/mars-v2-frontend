export default async function getCampaignPoints(
  pointsApi: AssetCampaignPointsApi,
  campaignId: AssetCampaignId,
): Promise<AssetCampaignPoints[]> {
  const { url, pointsStructure } = pointsApi
  const points = [] as AssetCampaignPoints[]

  try {
    await fetch(url.toString()).then(async (res) => {
      const data = (await res.json()) as any
      // TODO: wait for campaigns with different points api strucuture
      points.push({ id: campaignId, points: Number(data[pointsStructure[0]] ?? 0) })
    })
    return points
  } catch (e) {
    console.error(e)
    return points
  }
}
