import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Neutron1: ChainConfig = {
  id: ChainInfoID.Neutron1,
  isOsmosis: false,
  name: 'Neutron',
  stables: ['ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81'],
  campaignAssets: [
    {
      denom: 'factory/neutron1k6hr0f83e7un2wjf29cspk7j69jrnskk65k3ek2nj9dztrlzpj6q00rtsa/udatom',
      campaignIds: ['drop_apy', 'drop'],
      baseMultiplier: 1,
      collateralMultiplier: 3,
      campaignDenom: 'dATOM',
    },
    {
      denom:
        'factory/neutron1ke92yjl47eqy0mpgn9x4xups4szsm0ql6xhn4htw9zgn9wl5gm0quzh6ch/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    {
      denom:
        'factory/neutron1nfns3ck2ykrs0fknckrzd9728cyf77devuzernhwcwrdxw7ssk2s3tjf8r/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    {
      denom:
        'factory/neutron1yem82r0wf837lfkwvcu2zxlyds5qrzwkz8alvmg0apyrjthk64gqeq2e98/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 5,
    },
    {
      denom: 'ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C',
      campaignIds: ['stride'],
      campaignDenom: 'ATOM',
    },
    {
      denom: 'ibc/6569E05DEE32B339D9286A52BE33DFCEFC97267F23EF9CFDE0C055140967A9A5',
      campaignIds: ['stride'],
      campaignDenom: 'TIA',
    },
    {
      denom: 'ibc/BAA1D21893B1D36865C6CA44D18F4ACF08BAD70CB6863C4722E0A61703808F77',
      campaignIds: ['stride'],
      campaignDenom: 'DYDX',
    },
    {
      denom: 'factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH',
      campaignIds: ['lido'],
      campaignDenom: 'stETH',
    },
    {
      denom: 'ibc/4D04085167777659C11784A356D6B0D13D5C7F0CE77F7DB1152FE03A2DE2CBF2',
      campaignIds: ['lido'],
      campaignDenom: 'stETH',
    },
  ],
  deprecated: [
    'ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445',
    'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
  ],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
  },
  contracts: {
    creditManager: 'neutron1qdzn3l4kn7gsjna2tfpg3g3mwd6kunx4p50lfya59k02846xas6qslgs3r',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
    fallbackRpc: 'https://rpc.novel.remedy.tm.p2p.org',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    explorer: 'https://mintscan.io/neutron',
    dexAssets: 'https://neutron-cache-api.onrender.com/neutron-1/tokens',
    dexPools: 'https://neutron-cache-api.onrender.com/neutron-1/pools',
    gasPrices: '/feemarket/v1/gas_price/untrn',
    aprs: {
      vaults: '',
    },
  },
  network: NETWORK.MAINNET,
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
  gasPrice: '0.015untrn',
  hls: true,
  perps: false,
  farm: true,
  anyAsset: true,
  slinky: false,
}

export default Neutron1
