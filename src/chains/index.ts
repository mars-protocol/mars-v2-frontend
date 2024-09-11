import Neutron1 from 'chains/neutron/neutron-1'
import Pion1 from 'chains/neutron/pion-1'
import Osmosis1 from 'chains/osmosis/osmosis-1'
import { ChainInfoID } from 'types/enums'

const chains: { [key: string]: ChainConfig } = {
  [ChainInfoID.Osmosis1]: Osmosis1,
  [ChainInfoID.Pion1]: Pion1,
  [ChainInfoID.Neutron1]: Neutron1,
}

export default chains
