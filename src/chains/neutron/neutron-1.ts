import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'
import { getUrl } from 'utils/url'

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
      collateralMultiplier: 5,
      campaignDenom: 'dATOM',
    },
    {
      denom: 'factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia',
      campaignIds: ['drop_apy', 'drop'],
      baseMultiplier: 1,
      collateralMultiplier: 5,
      campaignDenom: 'dTIA',
    },
    {
      denom: 'factory/neutron1frc0p5czd9uaaymdkug2njz7dc7j65jxukp9apmt9260a8egujkspms2t2/udntrn',
      campaignIds: ['drop_apy', 'drop'],
      baseMultiplier: 1,
      collateralMultiplier: 5,
      campaignDenom: 'dNTRN',
    },
    //dATOM-NTRN
    {
      denom:
        'factory/neutron1ke92yjl47eqy0mpgn9x4xups4szsm0ql6xhn4htw9zgn9wl5gm0quzh6ch/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    //dATOM-USDC
    {
      denom:
        'factory/neutron1nfns3ck2ykrs0fknckrzd9728cyf77devuzernhwcwrdxw7ssk2s3tjf8r/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    //dTIA-NTRN
    {
      denom:
        'factory/neutron1hljhz97ng9guyqzpelkvphaky0gnav7wt8jmkr7n497wek8373dqgv8tdp/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    //dTIA-USDC
    {
      denom:
        'factory/neutron1awgqp5ma90qy0ecezzf6ghple8mpgtlv8z3kez065z7x5fprd4qs7vz4dc/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
    },
    //dATOM-ATOM
    {
      denom:
        'factory/neutron1yem82r0wf837lfkwvcu2zxlyds5qrzwkz8alvmg0apyrjthk64gqeq2e98/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 10,
    },
    //dTIA-TIA
    {
      denom:
        'factory/neutron1f6wucml5pmys4uh7mwurz2ge2v7gamkqdy03rfuatpdphmjjag3qeutzgx/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 10,
    },
    //dATOM-dTIA
    {
      denom:
        'factory/neutron1djs222dtwf3pw5h474fm68wc72ter5y4zftd36ugjs5e069hwqaq79pnrt/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 20,
    },
    //dNTRN-NTRN
    {
      denom:
        'factory/neutron1pd9u7h4vf36vtj5lqlcp4376xf4wktdnhmzqtn8958wyh0nzwsmsavc2dz/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 10,
    },
    //dNTRN-USDC
    {
      denom:
        'factory/neutron1hme8vcsky2xeq4qc4wg3uy9gc47xzga6uqk8plaps8tvutjshuwqajnze6/astroport/share',
      campaignIds: ['drop'],
      baseMultiplier: 50,
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
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    incentives: 'neutron1aszpdh35zsaz0yj80mz7f5dtl9zq5jfl8hgm094y0j0vsychfekqxhzd39',
    oracle: 'neutron1dwp6m7pdrz6rnhdyrx5ha0acsduydqcpzkylvfgspsz60pj2agxqaqrr7g',
    params: 'neutron1x4rgd7ry23v2n49y7xdzje0743c5tgrnqrqsvwyya2h6m48tz4jqqex06x',
    creditManager: 'neutron1qdzn3l4kn7gsjna2tfpg3g3mwd6kunx4p50lfya59k02846xas6qslgs3r',
    accountNft: 'neutron184kvu96rqtetmunkkmhu5hru8yaqg7qfhd8ldu5avjnamdqu69squrh3f5',
    perps: 'neutron1g3catxyv0fk8zzsra2mjc0v4s69a7xygdjt85t54l7ym3gv0un4q2xhaf6',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-lb.neutron.org',
    fallbackRpc: 'https://neutron-rpc.cosmos-apis.com',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-lb.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    explorer: 'https://mintscan.io/neutron',
    dexAssets: 'https://neutron-cache-api.onrender.com/neutron-1/tokens',
    dexPools: 'https://neutron-cache-api.onrender.com/neutron-1/pools',
    gasPrices: getUrl(
      process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-lb.neutron.org',
      '/feemarket/v1/gas_prices',
    ),
    aprs: {
      vaults: '',
      perpsVault: 'https://backend.prod.mars-dev.net/v2/perps_vault?chain=neutron',
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
    gasPriceStep: {
      low: 0.0053,
      average: 0.0053,
      high: 0.0053,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  hls: true,
  perps: true,
  farm: true,
  anyAsset: true,
  evmAssetSupport: true,
  slinky: true,
}

export default Neutron1
