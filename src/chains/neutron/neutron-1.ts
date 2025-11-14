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
      campaignIds: ['drop_apy'],
      campaignDenom: 'dATOM',
    },
    {
      denom: 'factory/neutron1ut4c6pv4u6vyu97yw48y8g7mle0cat54848v6m97k977022lzxtsaqsgmq/udtia',
      campaignIds: ['drop_apy'],
      campaignDenom: 'dTIA',
    },
    {
      denom: 'factory/neutron1frc0p5czd9uaaymdkug2njz7dc7j65jxukp9apmt9260a8egujkspms2t2/udntrn',
      campaignIds: ['drop_apy'],
      campaignDenom: 'dNTRN',
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
    {
      denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
      campaignIds: ['ntrn-rewards'],
      campaignDenom: 'wbtc',
    },
  ],
  deprecated: [
    'ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445',
    'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
    'ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C',
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
    marsStaking: 'neutron1rly5as5fdhhuasfw375hs4wyensvyx6eytzkdxtqfma6veyneggs457lnj',
    marsVotingPower: 'neutron1pxjszcmmdxwtw9kv533u3hcudl6qahsa42chcs24gervf4ge40usaw3pcr',
  },
  endpoints: {
    routes: 'https://router.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-lb.neutron.org',
    fallbackRpc: 'https://neutron-rpc.cosmos-apis.com',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-lb.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    explorer: 'https://mintscan.io/neutron',
    dexAssets: 'https://cache.marsprotocol.io/api/neutron-1/tokens',
    dexPools: 'https://cache.marsprotocol.io/api/neutron-1/pools',
    gasPrices: getUrl(
      process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-lb.neutron.org',
      '/feemarket/v1/gas_prices',
    ),
    managedVaults: 'https://backend.prod.mars-dev.net/v2/managed_vaults?chain=neutron',
    historicalManagedVaults:
      'https://backend.prod.mars-dev.net/v2/managed_vaults_historical?chain=neutron',
    aprs: {
      vaults: '',
      perpsVault:
        'https://backend.prod.mars-dev.net/v2/perps_vault_historical?chain=neutron&days=1',
    },
    liquidations: 'https://backend.prod.mars-dev.net/v2/liquidations?chain=neutron',
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
  vaultCodeId: '3679',
  hls: true,
  perps: true,
  farm: true,
  anyAsset: true,
  evmAssetSupport: true,
  slinky: true,
  managedVaults: true,
  swapFee: 0.0005,
}

export default Neutron1
