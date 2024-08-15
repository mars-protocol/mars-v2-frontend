import { CAMPAIGNS } from 'constants/campaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'

export default function useAssetCampaigns(type: AssetCampaignType) {
  const chainConfig = useChainConfig()

  return useMemo(() => {
    const campaigns = [] as AssetCampaign[]
    chainConfig.campaignAssets?.forEach((campaign) => {
      const campaignInfos = CAMPAIGNS.find((c) => c.type === type && c.id === campaign.campaignId)
      if (!campaignInfos) return
      campaigns.push(campaignInfos)
    })
    return [...new Set(campaigns)]
  }, [chainConfig.campaignAssets, type])
}
