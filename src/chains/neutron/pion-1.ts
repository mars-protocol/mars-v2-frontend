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
    redBank: 'neutron12y4g9hd529mhc9zfwzc8xu80l7kvjlv4u0fxdmdpwkflmfgz5txqd4elp7',
    incentives: 'neutron17cjywu4l49rdkk4nyltxgkz9j4as5mm4gczuq36nj9zr6dhnd6aqscxufx',
    oracle: 'neutron12cjn6akugc6ss9g8nxyucvu0ghvu7praem7udspfvenu4f4tn3gqea5dd8',
    params: 'neutron1l0lu3jy8yx4snkkzp62xku40efer4cgc07d8tz3xrc3wufgavxkq3qrla5',
    creditManager: 'neutron12lcfcwcfwtzxqavszpysupgrauswhgr7ugr6gugjlqylqxsat7cs7qwpkw',
    accountNft: 'neutron12q6y7xyec3rfdgz3wprc4mmndhnkh0h95t9xday3n6ry63cvkyps0vf0vs',
    perps: 'neutron1n4rneusydlg60rtmfgv00a2vymadt2pujasap97rzafj72cgvyaqryew5k',
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
