import { Bech32Address } from '@keplr-wallet/cosmos'

import ATOM from 'configs/assets/ATOM'
import NTRN from 'configs/assets/NTRN'
import USDC from 'configs/assets/USDC'
import USDollar from 'configs/assets/USDollar'
import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  assets: [
    { ...NTRN, denom: 'untrn', isPerpsEnabled: true },
    { ...USDC, denom: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42' },
    {
      ...ATOM,
      denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
      isPerpsEnabled: true,
    },
    USDollar,
  ],
  id: ChainInfoID.Pion1,
  name: 'Neutron Testnet',
  contracts: {
    redBank: 'neutron1fu3p73w5q8e4gz9u2hqmwk5nqmntzemt4a3reglzttn9vgcecsgqj4mzw3',
    incentives: 'neutron1ra7a2nxhv2x5e2pvz7lecc09kdtf458xks2me6kge64j5v5qat5spl2f35',
    oracle: 'neutron19rd3xd493rk6h3ctu3vxwqsqx5ldth40rkwen8gz9wjgvy49c92sk2ct3q',
    swapper: 'neutron1fryupl8phav82xps8z7gfsxxehw2rvjxuww505k77cqxzyu06ldsp3q5m0',
    params: 'neutron1vj60swh8v527zp5d5hvtzm78wdh9r6gu68sxevsw949nt2aemyyqnznlf8',
    creditManager: 'neutron1pky2mph7gsdfth4z6uwgkwc6d3tkp4hcpjfglhn73pegx0ktfpvqzyg9zh',
    accountNft: 'neutron10lrd9mqgavjwu0g9jcx4dyvycfehhgyvjk4c6zd3m4vyqdewljqqdhuven',
    perps: 'neutron15rrd66vwdcvphat369jgey7z03ugyavdfhp8e7r5m40sy4mnzudsxfsnm8',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://www.mintscan.io/neutron-testnet',
    anyAsset: 'https://app.astroport.fi/api/trpc/tokens.getAll',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/neutron',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: NETWORK.TESTNET,
  vaults: [],
  explorerName: 'Mintscan',
  bech32Config: Bech32Address.defaultBech32Config('neutron'),
  defaultCurrency: {
    coinDenom: 'NTRN',
    coinMinimalDenom: 'untrn',
    coinDecimals: 6,
    coinGeckoId: 'neutron',
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.045,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025untrn',
  hls: false,
  perps: true,
  farm: false,
  anyAsset: true,
}

export default Pion1
