import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Neutron1: ChainConfig = {
  id: ChainInfoID.Neutron1,
  isOsmosis: false,
  stables: ['ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349'],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
  },
  name: 'Neutron',
  contracts: {
    redBank: 'neutron1xucw5lg7sh9gmupd90jaeupvq0nm4pj5esu3ff7f64pacy2lyjsqfwft80',
    incentives: 'neutron1uf6nclgqvwnqv5lfverunenpzyw556h739sekj75k62h062k9lrqzhm3up',
    oracle: 'neutron14rjfsglulewu9narj077ata6p0dkfjjuayguku50f8tg2fyf4ups44a0ww',
    params: 'neutron102xprj349yslxu5xncpsmv8qk38ryag870xvgxgm5r9dnagvetwszssu59',
    creditManager: 'neutron1eekxmplmetd0eq2fs6lyn5lrds5nwa92gv5nw6ahjjlu8xudm2xs03784t',
    accountNft: 'neutron1jdpceeuzrptvrvvln3f72haxwl0w38peg6ux76wrm3d265ghne7se4wug2',
    perps: 'neutron14v9g7regs90qvful7djcajsvrfep5pg9qau7qm6wya6c2lzcpnms692dlt',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'http://135.181.139.174:26657',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'http://135.181.139.174:1317',
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
  gasPrice: '0.015untrn',
  hls: true,
  perps: false,
  farm: true,
  anyAsset: true,
}

export default Neutron1
