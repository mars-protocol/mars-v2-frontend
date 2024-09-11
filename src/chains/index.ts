import { ChainInfoID } from '../types/enums'
import Neutron1 from './neutron/neutron-1'
import Pion1 from './neutron/pion-1'
import Osmosis1 from './osmosis/osmosis-1'

const chains: { [key: string]: ChainConfig } = {
  [ChainInfoID.Osmosis1]: Osmosis1,
  [ChainInfoID.Pion1]: Pion1,
  [ChainInfoID.Neutron1]: Neutron1,
}

export default chains
