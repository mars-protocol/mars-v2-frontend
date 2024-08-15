import getCampaignPoints from 'api/campaign/getCampaignPoints'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssetCampaigns from 'hooks/campaign/useAssetCampaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'
import useStore from 'store'
import useSWRImmutable from 'swr/immutable'

export default function useCampaignPoints() {
  const chainConfig = useChainConfig()
  const pointCampaigns = useAssetCampaigns('points_with_multiplier')
  const walletAddress = useStore((s) => s.address)
  const account = useCurrentAccount()
  const campaignApis = useMemo(() => {
    const apis = [] as { api: AssetCampaignPointsApi; id: AssetCampaignId }[]
    pointCampaigns.forEach((campaign) => {
      if (!campaign.pointsApi) return
      const pointsApi = campaign.pointsApi
      if (campaign.pointsApi.queryVariable === 'address')
        pointsApi.url = pointsApi.url.replace('##ADDRESS##', walletAddress ?? '')
      if (campaign.pointsApi.queryVariable === 'accountId')
        pointsApi.url = pointsApi.url.replace('##ACCOUNTID##', account?.id ?? '')
      apis.push({ api: pointsApi, id: campaign.id })
    })
    return apis
  }, [account?.id, pointCampaigns, walletAddress])

  return useSWRImmutable(
    campaignApis && `chain/${chainConfig.id}/campaignPoints`,
    async () => {
      if (campaignApis.length === 0) return [] as AssetCampaignPoints[]

      const campaignPoints = Promise.all(
        [...new Set(campaignApis)].map((campaign) =>
          getCampaignPoints(campaign.api, campaign.id),
        ) ?? [],
      )
      return (await campaignPoints).flat()
    },
    {
      suspense: true,
      fallback: [] as AssetCampaignPoints[],
    },
  )
}
