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
    redBank: 'neutron1f8ag222s4rnytkweym7lfncrxhtee3za5uk54r5n2rjxvsl9slzq36f66d',
    incentives: 'neutron12hvgykldx0vxly59ta0ufjz776wxkl9k3r8ugln7xn6zus34a44s2vqw26',
    oracle: 'neutron1pev35y62g6vte0s9t67gsf6m8d60x36t7wr0p0ghjl9r3h5mwl0q4h2zwc',
    params: 'neutron1q66e3jv2j9r0duzwzt37fwl7h5njhr2kqs0fxmaa58sfqke80a2ss5hrz7',
    creditManager: 'neutron13vyqc4efsnc357ze97ppv9h954zjasuj9d0w8es3mk9ea8sg6mvsr3xkjg',
    accountNft: 'neutron1hx27cs7jjuvwq4hqgxn4av8agnspy2nwvrrq8e9f80jkeyrwrh8s8x645z',
    perps: 'neutron1yu66sjvgg8shfjxkdlxcqh8yg6tmymsgve8lv62q6k4wrs5mt0pq6ard0n',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    fallbackRpc: 'https://rpc-falcron.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://neutron-cache-api.onrender.com/tokens',
    dexPools: 'https://neutron-cache-api.onrender.com/pools',
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
