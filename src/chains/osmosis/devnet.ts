import Osmosis1 from 'chains/osmosis/osmosis-1'
import { ChainInfoID, NETWORK } from 'types/enums'

const Devnet: ChainConfig = {
  ...Osmosis1,
  id: ChainInfoID.OsmosisDevnet,
  network: NETWORK.TESTNET,
  name: 'Osmosis Devnet',
  endpoints: {
    ...Osmosis1.endpoints,
    explorer: 'https://www.mintscan.io/osmosis-testnet',
    rpc: process.env.NEXT_PUBLIC_OSMOSIS_TEST_RPC ?? 'https://rpc-osmosis.blockapsis.com',
    rest: process.env.NEXT_PUBLIC_OSMOSIS_TEST_REST ?? 'https://lcd-osmosis.blockapsis.com',
    swap: 'https://testnet.osmosis.zone',
  },
}

export default Devnet
