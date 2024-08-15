import { Droplet, Lido, Stride } from 'components/common/Icons'

export const CAMPAIGNS: AssetCampaign[] = [
  {
    id: 'stride',
    name: 'Stride Staking',
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
    name: 'Droplets',
    type: 'points_with_multiplier',
    pointsApi: {
      url: 'https://droplets.drop.money/api/droplet?address=##ADDRESS##',
      pointsStructure: ['points'],
      queryVariable: 'address',
    },
    pointBase: 'value',
    incentiveCopy: 'Earn ##MULTIPLIER##x Droplets',
    classNames: 'droplets',
    bgClassNames: 'gradient-droplets',
    detailedIncentiveCopy: '##POINTS## Droplets daily (##MULTIPLIER##x)',
    tooltip:
      'Droplets earned are based on the value of your position. Some positions may have a multiplier range (e.g.: 1-3x). The higher multiplier will be unlocked as soon as you borrow against the position.',
    totalPointsTooltip:
      'Total Droplets earned are updated every 24 hours and are counted for the entire wallet.',
  },
  {
    id: 'lido',
    name: 'Lido Staking',
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
