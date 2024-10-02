import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { BN } from 'utils/helpers'

function fetchPoints(points: BigNumber, pointsDecimals: number): number {
  return BN(points).shiftedBy(-pointsDecimals).toNumber()
}

export default async function getCampaignPoints(
  pointsApi: AssetCampaignPointsApi,
  campaignId: AssetCampaignId,
): Promise<AssetCampaignPoints[]> {
  const { url, pointsStructure, pointsDecimals } = pointsApi
  const points = [] as AssetCampaignPoints[]

  try {
    await fetchWithTimeout(url.toString(), FETCH_TIMEOUT).then(async (res) => {
      const data = (await res.json()) as any
      switch (pointsStructure.length) {
        case 1:
          points.push({
            id: campaignId,
            points: fetchPoints(BN(data[pointsStructure[0]] ?? 0), pointsDecimals),
          })
          break
        case 2:
          points.push({
            id: campaignId,
            points: fetchPoints(
              BN(data[pointsStructure[0]][pointsStructure[1]] ?? 0),
              pointsDecimals,
            ),
          })
          break
        case 3:
          points.push({
            id: campaignId,
            points: fetchPoints(
              BN(data[pointsStructure[0]][pointsStructure[1]][pointsStructure[2]] ?? 0),
              pointsDecimals,
            ),
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
