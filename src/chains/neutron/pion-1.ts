import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  id: ChainInfoID.Pion1,
  isOsmosis: false,
  name: 'Neutron Testnet',
  stables: ['ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42'],
  campaignAssets: [],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
  },
  contracts: {
    redBank: 'neutron1lzszsau8r2ku7lk9cjrsjdzhd379wdldn4kpcmevml4jggcry4gqh46c79',
    incentives: 'neutron1xwhvacuupcwh6uv3hsrlrmv8gday3pwl8g3jsxl8520elzaq027sst6j93',
    oracle: 'neutron176mnsk3sqlm4yy77rk2clz5svdpry2uj53x58rfu4hpc024k800q2d9wut',
    params: 'neutron1ldq52gq88pfnl7a0v65gpqtxj5ksgeqzcqqgry5uqkfvuvs7843qnx0nrx',
    creditManager: 'neutron1ar2ut7k9hx7vz2fhqmpkqzer29t66e4rkpr6zgu8hr4en5tpxx5seyfzrh',
    accountNft: 'neutron1qpkmsunlqxa69dyslwlh8400y52rg4hk9lsvadn8rjda0lmwt6sqfgtzhq',
    perps: 'neutron15nv2ejcmclxc00n73w2nmp4mk39rn596xtf65hv3l0t9uhfmux6q8um9u0',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    fallbackRpc: 'https://rpc-falcron.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://testnet.astroport.fi/api/tokens?chainId=pion-1',
    dexPools: 'https://testnet.astroport.fi/api/pools?chainId=pion-1',
    gasPrices: '/feemarket/v1/gas_price/untrn',
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
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025untrn',
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  slinky: true,
}

export default Pion1
