import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  id: ChainInfoID.Pion1,
  isOsmosis: false,
  name: 'Neutron Testnet',
  stables: ['factory/neutron1ke0vqqzyymlp5esr8gjwuzh94ysnpvj8er5hm7/UUSDC'],
  campaignAssets: [],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'factory/neutron1ke0vqqzyymlp5esr8gjwuzh94ysnpvj8er5hm7/UUSDC',
  },
  contracts: {
    redBank: 'neutron1on1y34gf9j3vvy3hsydwd3n67u9tc4yu0j4fv7e2kxapmkqht64krwsuu86g5',
    incentives: 'neutron1qk8pzqkldn6n4f4qfq237y8p0hzk6klphewun04tc3l72ztxnkzsu54uhp',
    oracle: 'neutron16dn8z0aywhuv7upzunyxuhzdrm6rznmvu73j0r2708yt8cf3m8hq0jqc5c',
    params: 'neutron13s6ksrcqdwvjpmztqd5su6xc9xrntyzttl0w0mnacu5turaasv6q8hf3ck',
    creditManager: 'neutron10tlaf72auk8c6zxe69h3h3gwaqyuw29yp24jecpvnwwcchlfcc7qj3vdvg',
    accountNft: 'neutron1etrn0su9tcqejt03cy0w8rvlf6pt43yzhpsk7p64ddc0f3vwywdsmdh7fh',
    perps: 'neutron1htmcuc8a43fxxctgpmxhjpm75fxy9rhe7rsvl7pl9e8qz0yzs8tq9mmrup',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    fallbackRpc: 'https://rpc-falcron.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://neutron-cache-api.onrender.com/pion-1/tokens',
    dexPools: 'https://neutron-cache-api.onrender.com/pion-1/pools',
    gasPrices: '/feemarket/v1/gas_price/untrn',
    aprs: {
      vaults: '',
      perpsVault: 'https://backend.test.mars-dev.net/v2/perps_vault?chain=neutron',
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
