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
    rpc: process.env.NEXT_PUBLIC_OSMOSIS_TEST_RPC ?? 'https://rpc-osmosis.blockapsis.com',
    rest: process.env.NEXT_PUBLIC_OSMOSIS_TEST_REST ?? 'https://lcd-osmosis.blockapsis.com',
    swap: 'https://testnet.osmosis.zone',
  },
}

export default Devnet
