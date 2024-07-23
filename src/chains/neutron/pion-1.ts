import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  id: ChainInfoID.Pion1,
  isOsmosis: false,
  name: 'Neutron Testnet',
  stables: ['ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42'],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
  },
  contracts: {
    redBank: 'neutron1cf4cr0zjf3zcapytz698vjr37wsqdfnyc4ws78ulm5h73u294w0sg7k20e',
    incentives: 'neutron1gk4yr4avhvje7tlncysesyeszsq249nn6m9xqvjgu8t929nn0pxsmek5zu',
    oracle: 'neutron1l8pudt3rgprwtmp9xxh35vzvh3ewlarr4rweeuz0u0yg7mm28zzqdpwgrh',
    params: 'neutron1mzejt993rlpqp0aycexq9m5yk4g0y3nwc7zmep0cuzmgtznek9gqr34gaz',
    creditManager: 'neutron1sqmdh9rymca8vhxneq5gfe5pwpwz3etzc8k5j6azk63kr529hgtqu9rnxh',
    accountNft: 'neutron1t929dumnqxhl28fuajmruvmaaxzd6q56qs9q4m09v2hve0g5n56q3t9xum',
    perps: 'neutron15rrd66vwdcvphat369jgey7z03ugyavdfhp8e7r5m40sy4mnzudsxfsnm8',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://testnet.astroport.fi/api/tokens?chainId=pion-1',
    dexPools: 'https://testnet.astroport.fi/api/pools?chainId=pion-1',
    aprs: {
      vaults: '',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: NETWORK.TESTNET,
  vaults: [],
  dexName: 'Astroport',
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
  perps: false,
  farm: true,
  anyAsset: true,
}

export default Pion1
