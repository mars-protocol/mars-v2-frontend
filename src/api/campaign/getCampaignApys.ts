import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { convertAprToApy } from 'utils/parsers'

function processApyData(aprOrApy: number, isApr: boolean, isPercent: boolean): number {
  if (!isApr && isPercent) return aprOrApy
  const percentApr = isPercent ? aprOrApy : aprOrApy * 100
  const apy = isApr ? convertAprToApy(percentApr, 365) : percentApr
  return apy
}

export default async function getCampaignApys(
  apyApi: AssetCampaignApyApi,
): Promise<AssetCampaignApy[]> {
  const { url, isApr, apyStructure, denomStructure, isPercent } = apyApi
  const apys = [] as AssetCampaignApy[]

  try {
    await fetchWithTimeout(url.toString(), FETCH_TIMEOUT).then(async (res) => {
      const data = (await res.json()) as any
      if (Array.isArray(data[apyStructure[0]])) {
        if (apyStructure[0] === denomStructure[0])
          data[apyStructure[0]].forEach((apyData: any) => {
            apys.push({
              apy: processApyData(apyData[apyStructure[1]], isApr, isPercent),
              denom: apyData[denomStructure[1]],
            })
          })
      } else if (Array.isArray(data)) {
        data.forEach((campaign: any) => {
          apys.push({
            apy: processApyData(campaign[apyStructure[0]], isApr, isPercent),
            denom: campaign[denomStructure[0]],
          })
        })
      } else {
        const apyData =
          apyStructure.length === 1 ? data[apyStructure[0]] : data[apyStructure[0]][apyStructure[1]]
        const denomData =
          denomStructure.length === 1
            ? data[denomStructure[0]]
            : data[denomStructure[0]][denomStructure[1]]

        apys.push({
          apy: processApyData(apyData, isApr, isPercent),
          denom: denomData,
        })
      }
    })
    return apys
  } catch (e) {
    console.error(e)
    return apys
  }
}
