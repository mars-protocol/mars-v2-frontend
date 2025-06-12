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
    redBank: 'neutron1ufcjwgucts9kdgsfvtnsdh9edx7j2fxcxf64e0s8kzrljzq5fq3stvpg74',
    incentives: 'neutron1p35wyc2zz6fr7kx9e5sw6acq7kr0hcqphuschljh60sz8ypeyhyq6jswuj',
    oracle: 'neutron14d0trdr8mueuhh0lxxmt596vrtpe7sy2avgrvklex6k3v7yy8s2stkdgex',
    params: 'neutron1p0lgz33aatghtscs6qwa38lzm3zpnrkrw0tj6g0tunpjzkm7cshs542n0q',
    creditManager: 'neutron1tqksp69rqe44xvkhwwgfgt64r508t5h6h0hqy2vz9aq7wjc5yhusrrghju',
    accountNft: 'neutron13asfwvgfjspc0w9l2534xnr853e58fnmlmlzkkq0n53pls0flx2q5c3qpw',
    perps: 'neutron1puj7jan803lnqtnche3m3z6gtyhw6vthu9ey9tpjyu7qvqryeaqsq74e3h',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-lb-pion.ntrn.tech',
    fallbackRpc: 'https://rpc-lb-pion.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-lb-pion.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://cache.marsprotocol.io/api/pion-1/tokens',
    dexPools: 'https://cache.marsprotocol.io/api/pion-1/pools',
    gasPrices: '/feemarket/v1/gas_price/untrn',
    managedVaults: 'https://backend.test.mars-dev.net/v2/managed_vaults?chain=neutron',
    historicalManagedVaults:
      'https://backend.test.mars-dev.net/v2/managed_vaults_historical?chain=neutron',
    aprs: {
      vaults: '',
      perpsVault:
        'https://backend.test.mars-dev.net/v2/perps_vault_historical?chain=neutron&days=1',
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
      low: 0.0053,
      average: 0.0053,
      high: 0.0053,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  vaultCodeId: '11864',
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  evmAssetSupport: true,
  slinky: true,
  managedVaults: true,
}

export default Pion1
