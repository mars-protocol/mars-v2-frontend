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
    redBank: 'neutron1v02dhe5x6wtxv6m6t6aucp55ev865mm482wnprhc5qg5rm48nklqe5mnq7',
    incentives: 'neutron1l0rs839qmhj6hde8nnxp4cf4jfyxeka0rzd47gjy9c7m6cwfgjrswv2t9z',
    oracle: 'neutron1p9fxllvhmucw44uma02sy4cjyn6lpy0apu0494rl02s3ajjsrnestefuh3',
    params: 'neutron1ewclmctyc89jlx4a9525qw4mr3av62e9xcj43d46hvy89s69tslqagszqy',
    creditManager: 'neutron1tyv6qlx66gj2l54ck0whxlf80x4yxtajrkd628qsv4vp8dc9z6cs33j0vv',
    accountNft: 'neutron1ussv397et3lh92vpyuqwamf5klgsw4k0pa3mvm0cqhkyr3gpzjcqvjn5mh',
    perps: 'neutron1djzm4zr55ndx4xh9lxtgd6nu3q9xzpqxpuvgsuehh5x8wk37dxuq7usjse',
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
