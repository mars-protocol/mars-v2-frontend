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
    redBank: 'neutron148ugl8aq0072ffygzq979h9k3slh3ufanwuvdnx6w6az2lqphvtqww3vzr',
    incentives: 'neutron16vc5hzf684epcckda8yqh9ae4p95lmmktqgj0vnmxthlwc76j5ks3tu6sc',
    oracle: 'neutron1ljj2nsy4svxmf8qcgpnmaykhp9j6jypkeg2g7zhc859vd353rr2qzedx7x',
    params: 'neutron1nqh8v9vkdq2uxq42j4ktjmfsq277mk07ltz38jwp0swf922kqczsu8xc0f',
    creditManager: 'neutron1gf4g4hqwu0wafpd775ava7r4z8cq8pqdqt98tdcewn9mka79ucwsh75xs9',
    accountNft: 'neutron1kxls9qadlg3qzarulqd845z9haeawakgjmvdlpu0fs0cudtq02mqzcujuz',
    perps: 'neutron1tyflx9eqg0nwq2e87xpn3sm0fnnxqujtds2nhjj78phafmrl4mmsnwe4ns',
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
}

export default Pion1
