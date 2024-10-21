import { Droplet, Lido, MilkyWay, Stride } from 'components/common/Icons'

export const CAMPAIGNS: AssetCampaign[] = [
  {
    id: 'stride',
    name: 'Stride Staking',
    type: 'apy',
    apyApi: {
      url: 'https://neutron-cache-api.onrender.com/stride',
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
    enabledOnV1: true,
  },
  {
    id: 'drop',
    name: 'Droplets',
    type: 'points_with_multiplier',
    pointsApi: {
      url: 'https://droplets.drop.money/api/droplet?address=##ADDRESS##',
      pointsStructure: ['result', 'data', 'points'],
      pointsDecimals: 6,
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
    enabledOnV1: false,
    v1Tooltip: 'Note: Only deposits on Mars v2 are eligible for the Droplets campaign.',
  },
  {
    id: 'drop_apy',
    name: 'Drop Staking',
    type: 'apy',
    apyApi: {
      url: 'https://neutron-cache-api.onrender.com/drop',
      isApr: false,
      isPercent: false,
      apyStructure: ['apy'],
      denomStructure: ['denom'],
    },
    incentiveCopy: '+##APY##% APY',
    classNames: 'droplets',
    bgClassNames: 'gradient-droplets',
    detailedIncentiveCopy: 'Deposits earn ##APY##% APY via Drop',
    tooltip: 'Your deposit will still earn the underlying Drop staking APY.',
    enabledOnV1: true,
  },
  {
    id: 'lido',
    name: 'Lido Staking',
    type: 'apy',
    apyApi: {
      url: 'https://neutron-cache-api.onrender.com/lido',
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
    enabledOnV1: true,
  },
  {
    id: 'milkyway',
    name: 'Milkyway Staking',
    type: 'apy',
    apyApi: {
      url: 'https://neutron-cache-api.onrender.com/milkyway',
      isApr: true,
      isPercent: true,
      apyStructure: ['apr'],
      denomStructure: ['symbol'],
    },
    incentiveCopy: '+##APY##% APY',
    classNames: 'milkyway',
    bgClassNames: 'gradient-milkyway',
    detailedIncentiveCopy: 'Deposits earn ##APY##% APY via Milkyway',
    tooltip: 'Your deposit will still earn the underlying Milkyway staking APY.',
    enabledOnV1: true,
  },
]

export function CampaignLogo({ campaignId }: { campaignId: AssetCampaignId }) {
  switch (campaignId) {
    case 'stride':
      return <Stride />
    case 'drop':
    case 'drop_apy':
      return <Droplet />
    case 'lido':
      return <Lido />
    case 'milkyway':
      return <MilkyWay />
    default:
      return null
  }
}
