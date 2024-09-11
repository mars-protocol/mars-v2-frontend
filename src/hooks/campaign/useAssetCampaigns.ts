import useChainConfig from 'chain/useChainConfig'
import { CAMPAIGNS } from 'constants/campaigns'
import { useMemo } from 'react'

export default function useAssetCampaigns(type: AssetCampaignType) {
  const chainConfig = useChainConfig()
  return useMemo(() => {
    if (!chainConfig.campaignAssets) return []
    const campaigns = [] as AssetCampaign[]
    chainConfig.campaignAssets?.forEach((campaign) => {
      const campaignInfos = CAMPAIGNS.find(
        (c) => c.type === type && campaign.campaignIds.includes(c.id),
      )
      if (!campaignInfos) return
      campaigns.push(campaignInfos)
    })
    return [...new Set(campaigns)]
  }, [chainConfig.campaignAssets, type])
}
