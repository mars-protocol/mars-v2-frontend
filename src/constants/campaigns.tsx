import { Droplet, Lido, MarsFragments, MilkyWay, Neutron, Stride } from 'components/common/Icons'

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
    detailedIncentiveCopy: 'Deposits earn additional ##APY##% APY via Neutron (NTRN) Rewards.',
    tooltip:
      "Your deposit will earn additional Neutron (NTRN) Rewards. ATTENTION: Don't reduce or withdraw your position after depositing, as this would forfeit your NTRN rewards. You can still add to your position safely.",
    enabledOnV1: true,
  },
  {
    id: 'fragments',
    name: 'Mars Fragments',
    type: 'points_with_multiplier',
    pointsApi: {
      url: 'https://amberfi-backend.prod.mars-dev.net/v2/fragments/by_wallet?chain=neutron&wallet=##ADDRESS##',
      pointsStructure: ['total_fragments', 'total_accumulated'],
      pointsDecimals: 0,
      queryVariable: 'address',
    },
    pointBase: 'value',
    incentiveCopy: 'Earn ##MULTIPLIER##x Mars Fragments',
    classNames: 'fragments',
    bgClassNames: 'gradient-fragments',
    detailedIncentiveCopy: '##POINTS## Mars Fragments daily (##MULTIPLIER##x)',
    tooltip: 'Mars Fragments earned are based on the value of your position.',
    totalPointsTooltip:
      'Total Mars Fragments earned are updated every 24 hours and are counted for the entire wallet.',
    enabledOnV1: true,
  },
]

export function CampaignLogo({ campaignId }: { campaignId: AssetCampaignId }) {
  switch (campaignId) {
    case 'stride':
      return <Stride />
    case 'drop_apy':
      return <Droplet />
    case 'lido':
      return <Lido />
    case 'milkyway':
      return <MilkyWay />
    case 'ntrn-rewards':
      return <Neutron />
    case 'fragments':
      return <MarsFragments />
    default:
      return null
  }
}
