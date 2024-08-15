import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAssetCampaigns from 'hooks/campaign/useAssetCampaigns'
import useCampaignPoints from 'hooks/campaign/useCampaignPoints'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getDailyAccountPoints } from 'utils/campaign'

export default function CampaignRewards() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()
  const pointCampaigns = useAssetCampaigns('points_with_multiplier')
  const assets = useWhitelistedAssets()
  const { data: campaignPoints } = useCampaignPoints()

  if (!pointCampaigns || !account) return <></>

  return pointCampaigns.map((campaign) => {
    const dailyPoints = getDailyAccountPoints(account, campaign, chainConfig, assets)
    const totalPoints = campaignPoints.find((cp) => cp.id === campaign.id)?.points ?? 0

    return (
      <div
        className='flex flex-wrap content-center justify-center w-full gap-1 p-4 rounded-md bg-black/20'
        key={campaign.id}
      >
        <Tooltip
          type='info'
          content={campaign?.totalPointsTooltip ?? ''}
          className='flex justify-center w-full group/campaign-points hover:cursor-help'
        >
          <>
            <FormattedNumber
              amount={totalPoints}
              className='text-2xl'
              options={{ minDecimals: 0, maxDecimals: 0, suffix: ` ${campaign.name}` }}
            />
            <InfoCircle className='w-3 h-3 ml-1 text-white/60 group-hover/campaign-points:text-white' />
          </>
        </Tooltip>
        <Text size='xs' className='w-full text-center text-white/60'>
          {`${dailyPoints} ${campaign.name} / daily with this Account`}
        </Text>
      </div>
    )
  })
}
