import { Droplet, Lido, MilkyWay, Neutron, Stride } from 'components/common/Icons'

export const CAMPAIGNS: AssetCampaign[] = [
  {
    id: 'stride',
    name: 'Stride Staking',
    type: 'apy',
    apyApi: {
      url: 'https://cache.marsprotocol.io/api/stride',
      isApr: true,
      isPercent: false,
      apyStructure: ['strideData', 'stats', 'strideYield'],
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
      'Droplets earned are based on the value of your position. Some positions may have a multiplier range (e.g.: 1-5x). The higher multiplier will be unlocked as soon as you borrow against the position.',
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
      url: 'https://cache.marsprotocol.io/api/drop',
      isApr: false,
      isPercent: false,
      apyStructure: ['dropData', 'apy'],
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
      url: 'https://cache.marsprotocol.io/api/lido',
      isApr: true,
      isPercent: true,
      apyStructure: ['lidoData', 'data', 'smaApr'],
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
      url: 'https://cache.marsprotocol.io/api/milkyway',
      isApr: true,
      isPercent: true,
      apyStructure: ['milkywayData', 'apr'],
      denomStructure: ['symbol'],
    },
    incentiveCopy: '+##APY##% APY',
    classNames: 'milkyway',
    bgClassNames: 'gradient-milkyway',
    detailedIncentiveCopy: 'Deposits earn ##APY##% APY via Milkyway',
    tooltip: 'Your deposit will still earn the underlying Milkyway staking APY.',
    enabledOnV1: true,
  },
  {
    id: 'ntrn-rewards',
    name: 'Neutron Rewards',
    type: 'apy',
    apyApi: {
      url: 'https://cache.marsprotocol.io/api/ntrn-rewards-mars',
      isApr: false,
      isPercent: true,
      apyStructure: ['ntrnRewardsDataMars', 'apy'],
      denomStructure: ['denom'],
    },
    incentiveCopy: '+##APY##% APY',
    classNames: 'ntrn-rewards',
    bgClassNames: 'gradient-ntrn-rewards',
    detailedIncentiveCopy: 'Deposits earn additional ##APY##% APY via NTRN Rewars.',
    tooltip:
      "Your deposit will earn the underlying Neutron Rewards APY. ATTENTION: Don't modify or close your position after depositing, as this would forfeit your NTRN rewards. You can still add to your position safely.",
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
    case 'ntrn-rewards':
      return <Neutron />
    default:
      return null
  }
}
