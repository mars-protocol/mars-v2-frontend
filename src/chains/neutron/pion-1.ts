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
    redBank: 'neutron1ecxhzp2d3jszlnlnu4rvt2aj4hsktmt9wwmc08vwqsxfc0t37huqxz5nzy',
    incentives: 'neutron1ngls5thsvu0ekzrua6pq0ajtg0k48sfy68qsdyzu48eayj9xd3lssc988h',
    oracle: 'neutron1s7l3zqg22zyn5rq7zv67um5qrtnulh33mwm28t5a3kdlrjq4z4lq5a4dte',
    params: 'neutron1rljzsheama2w3hxx4z5g29wwxyh9gfc70mym5z4c6ep8a0vjjn4qmv3dzj',
    creditManager: 'neutron1kejmclkxufzyrp38555g67je4parahqvw6xkhm523eysuhurf9tq388x60',
    accountNft: 'neutron18axnu2zashqqrfy85f6w6l3p37w90m2ez242z7ptkgktscfx36asrssx0m',
    perps: 'neutron1wmdenmmhjhhys9mz208v47l3a9uhx8hn6nkftf3588ccr0dajjcq9pqg4x',
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
