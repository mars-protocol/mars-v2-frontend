import { Droplet, Lido, Stride } from 'components/common/Icons'

export const CAMPAIGNS: AssetCampaign[] = [
  {
    id: 'stride',
    type: 'apy',
    apyApi: {
      url: 'https://edge.stride.zone/api/stake-stats',
      isApr: true,
      isPercent: false,
      apyStructure: ['stats', 'strideYield'],
      denomStructure: ['stats', 'denom'],
    },
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
  {
    id: 'lido',
    type: 'apy',
    apyApi: {
      url: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
      isApr: true,
      isPercent: true,
      apyStructure: ['data', 'smaApr'],
      denomStructure: ['meta', 'symbol'],
    },
    incentiveCopy: '+##APY##% APY',
    classNames: 'lido',
    bgClassNames: 'gradient-lido',
    detailedIncentiveCopy: 'Deposits earn ##APY##% APY via Lido',
    tooltip:
      'Your deposit will still earn the underlying Lido staking yield. This number is based on the moving average of APR for 7 days period.',
  },
]

export function CampaignLogo({ campaignId }: { campaignId: AssetCampaignId }) {
  switch (campaignId) {
    case 'stride':
      return <Stride />
    case 'drop':
      return <Droplet />
    case 'lido':
      return <Lido />
    default:
      return null
  }
}
