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
    redBank: 'neutron10z0hh8rkgpxay28zf4zm0knd7h6v6qulw8tmcg28qyrzqvnkrrcsre06tx',
    incentives: 'neutron192dwv4j2f08z959k0htzlutgejzxa3mkgp0ux3xj798yjqzcg7aqrw4dmj',
    oracle: 'neutron1k529nj77qcyk4ure79mxzcud636l8x6yjdep2sqreypk6fkm5afq6vlhxu',
    params: 'neutron19hxedyjky47wyn5h3xpc0gcl94rnx5gmydgycfl7hdkstuvn9w2sna5zu9',
    creditManager: 'neutron1gkh5u8ue3djq9rfgc4ymyt35yfjt7l0gx0mwg4j2jwnf9w54lhashy44uc',
    accountNft: 'neutron1xcp7qn8f6wjhgvg2cn7vjkmn6sqpslf7ezea3sfvhmlhysels4nqnldu3w',
    perps: 'neutron19p5zu0fuhl9qnc5pz4xj0fzhy74r2h50g5cmumgy7yntht0zau7sck3aky',
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
    managedVaults: 'https://backend.test.mars-dev.net/v2/managed_vaults?chain=neutron',
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
    gasPriceStep: {
      low: 0.0053,
      average: 0.0053,
      high: 0.0053,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  vaultCodeId: '11495',
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  evmAssetSupport: true,
  slinky: true,
  managedVaults: true,
}

export default Pion1
