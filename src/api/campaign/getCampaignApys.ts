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
      const dataObject = data[apyStructure[0]]
      if (Array.isArray(dataObject[apyStructure[1]])) {
        if (apyStructure[1] === denomStructure[0])
          dataObject[apyStructure[1]].forEach((apyData: any) => {
            apys.push({
              apy: processApyData(apyData[apyStructure[2]], isApr, isPercent),
              denom: apyData[denomStructure[1]],
            })
          })
      } else if (Array.isArray(dataObject)) {
        dataObject.forEach((campaign: any) => {
          apys.push({
            apy: processApyData(campaign[apyStructure[1]], isApr, isPercent),
            denom: campaign[denomStructure[0]],
          })
        })
      } else {
        const apyData =
          apyStructure.length === 2
            ? dataObject[apyStructure[1]]
            : dataObject[apyStructure[1]][apyStructure[2]]
        const denomData =
          denomStructure.length === 1
            ? dataObject[denomStructure[0]]
            : dataObject[denomStructure[0]][denomStructure[1]]
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
