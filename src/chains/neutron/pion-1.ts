import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  id: ChainInfoID.Pion1,
  isOsmosis: false,
  name: 'Neutron Testnet',
  stables: ['factory/neutron1ke0vqqzyymlp5esr8gjwuzh94ysnpvj8er5hm7/USDC'],
  campaignAssets: [],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'factory/neutron1ke0vqqzyymlp5esr8gjwuzh94ysnpvj8er5hm7/USDC',
  },
  contracts: {
    redBank: 'neutron14zjmuel0t8q9rqezp2vtj706ckl8eqtrkc2cjexsssh8vgpuzxdqjuqydr',
    incentives: 'neutron1lkk4e6y9pjkev9patc3t6lwey7032f3eqh577v8dvk9ws8awsv4sk0t45a',
    oracle: 'neutron1hkggq76w07x53z9hu2hhq8kn8n9e77vc0nztrl2h3sn4cgz9v0ps577a53',
    params: 'neutron15tdtcemvkj3g7vuuz83twcekg86j3f58jet9lv08u0j7j8ztymsqd47l9z',
    creditManager: 'neutron1gtqq647nrkgwxr3anrdty6fqfvfqav9kkwuu7el0gw754yx42dgs0s92zx',
    accountNft: 'neutron128pgfadzvmck5qccgpcjwew4lgsn5e4ha82cu7rrnyg45rrpxessuqdnmt',
    perps: 'neutron1mmjd5gz5943s4nnd5929s5hxfzw6lv3jrp3zthkxkanve70qax4qwyyzt5',
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
      perpsVault: 'https://testnet-api.marsprotocol.io/v2/perps_vault?chain=neutron',
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
