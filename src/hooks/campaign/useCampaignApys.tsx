import getCampaignApys from 'api/campaign/getCampaignApys'
import { CAMPAIGNS } from 'constants/campaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'

export default function useCampaignApys() {
  const chainConfig = useChainConfig()
  const campaignApis = useMemo(() => {
    const apis = [] as AssetCampaignApyApi[]
    chainConfig.campaignAssets?.forEach((campaign) => {
      const campaignInfos = CAMPAIGNS.find((c) => c.id === campaign.campaignId)
      if (!campaignInfos?.apyApi) return
      apis.push(campaignInfos.apyApi)
    })
    return apis
  }, [chainConfig.campaignAssets])

  return useSWRImmutable(
    campaignApis && `chain/${chainConfig.id}/campaignAprs`,
    async () => {
      if (campaignApis.length === 0) return [] as AssetCampaignApy[]

      const campaignAprs = Promise.all(
        [...new Set(campaignApis)].map((api) => getCampaignApys(api ?? '')) ?? [],
      )
      return (await campaignAprs).flat()
    },
    {
      suspense: true,
      fallback: [] as AssetCampaignApy[],
    },
  )
}
