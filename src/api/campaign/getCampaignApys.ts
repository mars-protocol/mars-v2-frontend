import { convertAprToApy } from 'utils/parsers'

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
          data[apyStructure[0]].forEach((apyData: any, i: number) => {
            const apy = isApr
              ? convertAprToApy(apyData[apyStructure[1]] ?? 0, 365)
              : (apyData[apyStructure[1]] ?? 0)
            apys.push({
              apy: isPercent ? apy : apy * 100,
              denom: apyData[denomStructure[1]],
            })
          })
        // TODO: wait for a campaign that has different api structure
      } else {
        const apy = isApr
          ? convertAprToApy(data[apyStructure[0]][apyStructure[1]], 365)
          : data[apyStructure[0]][apyStructure[1]]
        apys.push({
          apy: isPercent ? apy : apy * 100,
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
