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
    redBank: 'neutron1lg8aagjxe5l7dpfgd5e96wycl4cr788fwgegvgzn5tgk7q85hksskc6jdl',
    incentives: 'neutron1tgv4hshvmg7pkrvjsdylqp0xdwwxckd43ssxshqfgsvwj5x4sjhs4zsvgy',
    oracle: 'neutron1j2s4qhhmwmy3qj9jyje02pxfvyln4wk0qz7vr74zh22w2mupmlnqed6x2t',
    params: 'neutron1s40kmty2rmua3t0azzvq3y6xddw0x04a8m7e7802m5rq27c25ecsyw5t66',
    creditManager: 'neutron1cd0vt5r3wx7d73e4hyyf9y89mt93w9n0el8tz3rrslt0uz497kyq3x2v7j',
    accountNft: 'neutron1cf50cnrwtrt64xd5uf6mpwpzf4z5zsvla94wghlxzjzuc5jvd4nq25qfnp',
    perps: 'neutron1t0e6dgwwtm7sqvum9he4uc8t0cc3kq9c9lha07kyhpr0dsvd4u8qkulnje',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    fallbackRpc: 'https://rpc-falcron.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://testnet.astroport.fi/api/tokens?chainId=pion-1',
    dexPools: 'https://testnet.astroport.fi/api/pools?chainId=pion-1',
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
