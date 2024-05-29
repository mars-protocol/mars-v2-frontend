import Pion1 from 'chains/neutron/pion-1'
import Devnet from 'chains/osmosis/devnet'
import Osmosis1 from 'chains/osmosis/osmosis-1'
import { ChainInfoID } from 'types/enums'

const chains: { [key: string]: ChainConfig } = {
  [ChainInfoID.OsmosisDevnet]: Devnet,
  [ChainInfoID.Osmosis1]: Osmosis1,
  [ChainInfoID.Pion1]: Pion1,
}

export default chains
