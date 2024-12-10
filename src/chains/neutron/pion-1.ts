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
    redBank: 'neutron1yxqrpv00vmngwqc93wpkjgtuudxplu0s3sku2836gz5mydlu3qfsxaf47j',
    incentives: 'neutron1fy99tz90kugxugn8hvhkxzxg2xsceaq52ttgd8m59xczqnygy56s55z0t8',
    oracle: 'neutron1jr9yq72ytpz7dwzf0h0jtzsrld40lx2fux6e9746nmz2dv7wu8zsv3e88d',
    params: 'neutron1qfhrg42k5672ak9yhwn7hxnmq9eygeqvdmyat2d6qthdakl5qn2szyxgdl',
    creditManager: 'neutron160gwyjdqntz6mz6qll4etttty8rwwg2ppyu99ufcl9lg50h9359svcakhl',
    accountNft: 'neutron155jh2h3e8u32na0rvejzxktfz4ucagttl43uqupzkk0txxfpz72qq7w6sy',
    perps: 'neutron1memexx2za0586jn252duf8umsytknhcynrvscnrd9m2x6emlq4mq34zwkj',
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
  vaultCodeId: '5467',
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  slinky: true,
  managedVaults: true,
}

export default Pion1
