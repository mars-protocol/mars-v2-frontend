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
    redBank: 'neutron19ucpt6vyha2k6tgnex880sladcqsguwynst4f8krh9vuxhktwkvq3yc3nl',
    incentives: 'neutron1xqfgy03gulfyv6dnz9ezsjkgcvsvlaajskw35cluux9g05cmcu4sfdkuvc',
    oracle: 'neutron12vejgch3jd74j99kdrpjf57f6zjlu425yyfscdjnmnn4vvyrazvqgvcp24',
    params: 'neutron14a0qr0ahrg3f3yml06m9f0xmvw30ldf3scgashcjw5mrtyrc4aaq0v4tm9',
    creditManager: 'neutron1zkxezh5e6jvg0h3kj50hz5d0yrgagkp0c3gcdr6stulw7fye9xlqygj2gz',
    accountNft: 'neutron1pgk4ttz3ned9xvqlg79f4jumjet0443uqh2rga9ahalzgxqngtrqrszdna',
    perps: 'neutron1dcv8sy6mhgjaum5tj8lghxgxx2jgf3gmcw6kg73rj70sx5sjpguslzv0xu',
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
    gasPriceStep: {
      low: 0.0053,
      average: 0.0053,
      high: 0.0053,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  evmAssetSupport: true,
  slinky: true,
}

export default Pion1
