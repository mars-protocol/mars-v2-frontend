export default async function getCampaignPoints(
  pointsApi: AssetCampaignPointsApi,
  campaignId: AssetCampaignId,
): Promise<AssetCampaignPoints[]> {
  const { url, pointsStructure } = pointsApi
  const points = [] as AssetCampaignPoints[]

  try {
    await fetch(url.toString()).then(async (res) => {
      const data = (await res.json()) as any
      switch (pointsStructure.length) {
        case 1:
          points.push({ id: campaignId, points: Number(data[pointsStructure[0]] ?? 0) })
          break
        case 2:
          points.push({
            id: campaignId,
            points: Number(data[pointsStructure[0]][pointsStructure[1]] ?? 0),
          })
          break
        case 3:
          points.push({
            id: campaignId,
            points: Number(data[pointsStructure[0]][pointsStructure[1]][pointsStructure[2]] ?? 0),
          })
          break

        default:
          break
      }
    })
    return points
  } catch (e) {
    console.error(e)
    return points
  }
}
