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
    redBank: 'neutron1vxvqs075q7y9tvpmt60xjmejrfvuw8mcvgqkug67des96y7psalqrl4cn6',
    incentives: 'neutron10a4rt7utgqrpf24jeluc2gt42r83f0ammxnmntq687ycwh7ugysqnfwduy',
    oracle: 'neutron13a7vspwpf3vnjq292xsvk8l8y0r7uwn4vtaev04zyl7r0wu8slzsveq09g',
    params: 'neutron13pwuvh2kwlvs9q4cm9yfm5xymghle066hq40m2yagg6sh7c09ncqzey946',
    creditManager: 'neutron13jm8hk5znqk5t5mlvgphvfea300kayqhhy8hdhmrdtsfypkl7ehqke4d2m',
    accountNft: 'neutron1l9vthzck3t7z2ys943jwaxskkjaws3qexhyuhsytqpx8t9ht6lyq4tre4d',
    perps: 'neutron1ey5vc5yvlauea7aryuvuxphxvr473ayjxw7h30eq62s4uzcjsx4qsvnfxs',
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
  hls: false,
  perps: true,
  farm: true,
  anyAsset: true,
  slinky: true,
}

export default Pion1
