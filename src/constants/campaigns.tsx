import { Droplet, Stride } from 'components/common/Icons'

export const CAMPAIGNS: AssetCampaign[] = [
  {
    id: 'stride',
    type: 'apy',
    apyApi: 'https://edge.stride.zone/api/stake-stats',
    incentiveCopy: '+##APY##% APY',
    classNames: 'stride',
    bgClassNames: 'gradient-stride',
    detailedIncentiveCopy: 'Deposits earn ##APY##% APY via Stride',
    tooltip: 'Your deposit will still earn the underlying Stride staking APY.',
  },
  {
    id: 'drop',
    type: 'points_with_multiplier',
    pointBase: 'value',
    incentiveCopy: 'Earn ##MULTIPLIER##x Droplets',
    classNames: 'droplets',
    bgClassNames: 'gradient-droplets',
    detailedIncentiveCopy: 'Earn ##POINTS## Droplets Daily (##MULTIPLIER##x)',
    tooltip:
      "To celebrate Drop Protocol's launch, they're running a campaign to earn Droplets. Droplets earned are based on the value of your position.",
  },
]

export function CampaignLogo({ campaignId }: { campaignId: AssetCampaignId }) {
  switch (campaignId) {
    case 'stride':
      return <Stride />
    case 'drop':
      return <Droplet />
    default:
      return null
  }
}
