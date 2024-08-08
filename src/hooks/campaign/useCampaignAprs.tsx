import getStakingAprs from 'api/hls/getAprs'
import { CAMPAIGNS } from 'constants/campaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWRImmutable from 'swr/immutable'

export default function useCampaignAprs() {
  const chainConfig = useChainConfig()
  const campaignApis = [] as string[]
  chainConfig.campaignAssets?.forEach((campaign) => {
    const campaignInfos = CAMPAIGNS.find((c) => c.id === campaign.campaignId)
    if (!campaignInfos?.apyApi) return
    campaignApis.push(campaignInfos.apyApi)
  })

  return useSWRImmutable(
    `chain/${chainConfig.id}/campaignAprs`,
    async () => {
      if (campaignApis.length === 0) return [] as StakingApr[]

      const campaignAprs = Promise.all(
        [...new Set(campaignApis)].map((api) => getStakingAprs(api ?? '')) ?? [],
      )
      return (await campaignAprs).flat()
    },
    {
      suspense: true,
      fallback: [] as StakingApr[],
    },
  )
}
