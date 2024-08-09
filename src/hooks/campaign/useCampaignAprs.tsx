import getStakingAprs from 'api/hls/getAprs'
import { CAMPAIGNS } from 'constants/campaigns'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'

export default function useCampaignAprs() {
  const chainConfig = useChainConfig()
  const campaignApis = useMemo(() => {
    const apis = [] as string[]
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
