import { convertAprToApy } from 'utils/parsers'

function processApyData(aprOrApy: number, isApr: boolean, isPercent: boolean): number {
  if (!isApr && isPercent) return aprOrApy
  const apy = isApr ? convertAprToApy(aprOrApy, 365) : aprOrApy
  return isPercent ? apy : apy * 100
}

export default async function getCampaignApys(
  apyApi: AssetCampaignApyApi,
): Promise<AssetCampaignApy[]> {
  const { url, isApr, apyStructure, denomStructure, isPercent } = apyApi
  const apys = [] as AssetCampaignApy[]

  try {
    await fetch(url.toString()).then(async (res) => {
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
        apys.push({
          apy: processApyData(data[apyStructure[0]][apyStructure[1]], isApr, isPercent),
          denom: data[denomStructure[0]][denomStructure[1]],
        })
      }
    })
    return apys
  } catch (e) {
    console.error(e)
    return apys
  }
}
