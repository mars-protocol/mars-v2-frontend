import getCampaignApys from 'api/campaign/getCampaignApys'
import useAssetCampaigns from 'hooks/campaign/useAssetCampaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'

export default function useCampaignApys() {
  const chainConfig = useChainConfig()
  const apyCampaigns = useAssetCampaigns('apy')
  const campaignApis = useMemo(() => {
    const apis = [] as AssetCampaignApyApi[]
    apyCampaigns.forEach((campaign) => {
      if (!campaign.apyApi) return
      apis.push(campaign.apyApi)
    })
    return apis
  }, [apyCampaigns])

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
