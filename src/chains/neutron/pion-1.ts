import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'
import { getUrl } from 'utils/url'

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
    redBank: 'neutron1u7850wkf52lyly7wmzrx3lkkqvur9wnwu9vnh0grpa23mn2fuujqsym5a9',
    incentives: 'neutron1xlkxdc863efk0l2whl53pzvf9t90t68pxmruv3dnx2ay6qnp2dsqf0n83w',
    oracle: 'neutron1rtvghc7ux7mvrq0j88va494t9rl4ylye3u73fgn7f3g0fxkt3lfs29lnwt',
    params: 'neutron1upvt9j5f6l98sfw6qjf4xmcmggfpzh8yrp33m0997qnk6e2rlyhsfnstw5',
    creditManager: 'neutron17qanmykcr5fr4kmvstzn03efqpdufk6dzxtna0970dkjar2qjd8s9h4pdd',
    accountNft: 'neutron1tk3hfrcl6k05tkeewzzalamhaye7q669mz5htk3s9tdzy73up8zsnt47p9',
    perps: 'neutron15dwg9zp3ngv724ehz6c5k2v4emwu6jyj6u4tc560p5qn358pyhvsl4yf84',
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
    gasPrices: getUrl(
      process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-lb-pion.ntrn.tech',
      '/feemarket/v1/gas_prices',
    ),
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
