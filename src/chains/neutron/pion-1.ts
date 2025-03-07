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
    redBank: 'neutron1pljfdf2q86zvk7qmsc7fwa5rxlwlges5ms3nafdpp3use3p0t08s52kwjf',
    incentives: 'neutron1ckl8mmy6ulkvdpd9xpyksmk50r26y4gkvtuahf8wkltqzhuu0jds9808r7',
    oracle: 'neutron186p4wpap8f68hvs0pcsykvx4aupf338wehl8t3n6246ks23j90lsyfkxxw',
    params: 'neutron1mvpffjj5qumlrc9yllnucafktvmgd5wxmkctps08twaamw8exqdsnn4fcg',
    creditManager: 'neutron1mtsn44ursztxla8c0jehktudw82fl8qlkc9ulm7064dc08mcld0q89tvcm',
    accountNft: 'neutron18pxl0e8r8ptg5288lvygjx8yz0z2wmvg9lm2y9spvxqtnt66na3q0wcl6c',
    perps: 'neutron1rrcp55smjyd5n86ct3du8dl03m7swhgss5rajgwlc50cpnnnrr9q755xef',
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
