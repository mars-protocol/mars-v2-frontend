import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

import Osmosis1 from './osmosis-1'

const Devnet: ChainConfig = {
  ...Osmosis1,
  id: ChainInfoID.OsmosisDevnet,
  network: NETWORK.TESTNET,
  name: 'Osmosis Devnet',
  endpoints: {
    ...Osmosis1.endpoints,
    rpc: 'https://rpc.devnet.osmosis.zone/',
    rest: 'https://lcd.devnet.osmosis.zone/',
    swap: 'https://testnet.osmosis.zone',
  },
}

export default Devnet
