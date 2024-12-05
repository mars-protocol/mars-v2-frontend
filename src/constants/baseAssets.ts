import { ChainInfoID } from 'types/enums'

const baseAssets: { [key: string]: Asset } = {
  [ChainInfoID.Neutron1]: {
    denom: 'untrn',
    name: 'Neutron',
    decimals: 6,
    symbol: 'NTRN',
    campaigns: [],
  },
  [ChainInfoID.Pion1]: {
    denom: 'untrn',
    name: 'Neutron',
    decimals: 6,
    symbol: 'NTRN',
    campaigns: [],
  },
  [ChainInfoID.Osmosis1]: {
    denom: 'uosmo',
    name: 'Osmosis',
    decimals: 6,
    symbol: 'OSMO',
    campaigns: [],
  },
}

export default baseAssets
