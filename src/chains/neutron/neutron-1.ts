import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Neutron1: ChainConfig = {
  id: ChainInfoID.Neutron1,
  isOsmosis: false,
  name: 'Neutron',
  stables: ['ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349'],
  campaignAssets: [
    {
      denom: 'factory/neutron1k6hr0f83e7un2wjf29cspk7j69jrnskk65k3ek2nj9dztrlzpj6q00rtsa/udatom',
      campaignId: 'drop',
      baseMultiplier: 1,
      collateralMultiplier: 3,
    },
    {
      denom:
        'factory/neutron1ke92yjl47eqy0mpgn9x4xups4szsm0ql6xhn4htw9zgn9wl5gm0quzh6ch/astroport/share',
      campaignId: 'drop',
      baseMultiplier: 50,
    },
    {
      denom:
        'factory/neutron1nfns3ck2ykrs0fknckrzd9728cyf77devuzernhwcwrdxw7ssk2s3tjf8r/astroport/share',
      campaignId: 'drop',
      baseMultiplier: 50,
    },
    {
      denom:
        'factory/neutron1yem82r0wf837lfkwvcu2zxlyds5qrzwkz8alvmg0apyrjthk64gqeq2e98/astroport/share',
      campaignId: 'drop',
      baseMultiplier: 5,
    },
    {
      denom: 'ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C',
      campaignId: 'stride',
      campaignDenom: 'ATOM',
    },
    {
      denom: 'ibc/6569E05DEE32B339D9286A52BE33DFCEFC97267F23EF9CFDE0C055140967A9A5',
      campaignId: 'stride',
      campaignDenom: 'TIA',
    },
    {
      denom: 'ibc/BAA1D21893B1D36865C6CA44D18F4ACF08BAD70CB6863C4722E0A61703808F77',
      campaignId: 'stride',
      campaignDenom: 'DYDX',
    },
    {
      denom: 'factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH',
      campaignId: 'lido',
      campaignDenom: 'stETH',
    },
    {
      denom: 'ibc/4D04085167777659C11784A356D6B0D13D5C7F0CE77F7DB1152FE03A2DE2CBF2',
      campaignId: 'lido',
      campaignDenom: 'stETH',
    },
  ],
  deprecated: ['ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445'],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
  },
  contracts: {
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    incentives: 'neutron1aszpdh35zsaz0yj80mz7f5dtl9zq5jfl8hgm094y0j0vsychfekqxhzd39',
    oracle: 'neutron1dwp6m7pdrz6rnhdyrx5ha0acsduydqcpzkylvfgspsz60pj2agxqaqrr7g',
    params: 'neutron144lvre6xy4eqz88aw4tkuaq8xl9w0yhqwhc6m82tjgud8mt8veuspydnqq',
    creditManager: 'neutron1vq78hcqrnvp7evcvnfgq8zev5a93rwv0mcd5z70qqy6qjqh0t33qka3vqz',
    accountNft: 'neutron1394jqgshzp0eyl8vha6gzja0cqfc46ma673cl3nnkhdjd9jsglts8leua0',
    perps: 'neutron14v9g7regs90qvful7djcajsvrfep5pg9qau7qm6wya6c2lzcpnms692dlt',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-vele.neutron-1.neutron.org',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-vele.neutron-1.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    explorer: 'https://mintscan.io/neutron',
    dexAssets: 'https://api.astroport.fi/api/tokens?chainId=neutron-1',
    dexPools: 'https://api.astroport.fi/api/pools?chainId=neutron-1',
    aprs: {
      vaults: '',
      stride: 'https://edge.stride.zone/api/stake-stats',
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
      low: 0,
      average: 0.015,
      high: 0.025,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.015',
  hls: false,
  perps: false,
  farm: false,
  anyAsset: true,
}

export default Neutron1
