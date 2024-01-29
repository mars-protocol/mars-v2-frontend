import Osmosis1 from 'configs/chains/osmosis/osmosis-1'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

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
