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
    redBank: 'neutron1lqunhyz2k7venenctnhlzyht3q7zdc028t0gzgh6d4zaxkmfhuns46zsyc',
    incentives: 'neutron1qk8pzqkldn6n4f4qfq237y8p0hzk6klphewun04tc3l72ztxnkzsu54uhp',
    oracle: 'neutron14hr428nte9qef9hk9rhxcmcxefpndu5mp0kzke6p06cdx8kq5x2sy78k67',
    params: 'neutron1xn35nyjzp45lmh4q2s28g46c726sxcmmry850c9g5vhgc5x8t2lsyklv0g',
    creditManager: 'neutron1thj48d7jrtwn6cm5smuc47chgdhuj4ynlcsvpxzw7zpuchm6lgystag50d',
    accountNft: 'neutron125v7pxyty2meh5zaa6tknengdsj04a3xgu945j2fk5jm79scdr6ssknypm',
    perps: 'neutron14g68wz0xvcjhyawyng9jnyu9k0gehg9yqeqq5s5kaxv6jwpfdwrsh2ak5x',
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
