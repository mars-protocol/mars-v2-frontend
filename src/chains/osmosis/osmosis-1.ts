import { Bech32Address } from '@keplr-wallet/cosmos'

import { VAULTS_META_DATA } from 'constants/vaults'
import { ChainInfoID, NETWORK } from 'types/enums'
import { getUrl } from 'utils/url'

const LP_ASSETS = [
  {
    symbol: 'OSMO-ATOM',
    name: 'OSMO-ATOM LP',
    denom: 'gamm/pool/1',
    decimals: 6,
  },
  {
    symbol: 'OSMO-USDC.axl',
    name: 'OSMO-USDC.axl LP',
    denom: 'gamm/pool/678',
    decimals: 6,
  },
  {
    symbol: 'OSMO-WBTC.axl',
    name: 'OSMO-WBTC.axl LP',
    denom: 'gamm/pool/712',
    decimals: 6,
  },
  {
    symbol: 'OSMO-WETH.axl',
    name: 'OSMO-WETH.axl LP',
    denom: 'gamm/pool/704',
    decimals: 6,
  },
  {
    symbol: 'stATOM-ATOM',
    name: 'stATOM-ATOM LP',
    denom: 'gamm/pool/803',
    decimals: 6,
  },
]

const Osmosis1: ChainConfig = {
  lp: LP_ASSETS,
  stables: [
    'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
    'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    'ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB',
  ],
  defaultTradingPair: {
    buy: 'uosmo',
    sell: 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
  },
  bech32Config: Bech32Address.defaultBech32Config('osmo'),
  contracts: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    accountNft: 'osmo1450hrg6dv2l58c0rvdwx8ec2a0r6dd50hn4frk370tpvqjhy8khqw7sw09',
    oracle: 'osmo1mhznfr60vjdp2gejhyv2gax9nvyyzhd3z0qcwseyetkfustjauzqycsy2g',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
    incentives: 'osmo1nkahswfr8shg8rlxqwup0vgahp0dk4x8w6tkv3rra8rratnut36sk22vrm',
    swapper: 'osmo1wee0z8c7tcawyl647eapqs4a88q8jpa7ddy6nn2nrs7t47p2zhxswetwla',
    params: 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent',
    pyth: 'osmo13ge29x4e2s63a8ytz2px8gurtyznmue4a69n5275692v3qn3ks8q7cwck7',
    perps: '',
  },
  defaultCurrency: {
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo',
    coinDecimals: 6,
    coinGeckoId: 'osmosis',
    gasPriceStep: {
      low: 0.0025,
      average: 0.025,
      high: 0.04,
    },
  },
  endpoints: {
    rpc: process.env.NEXT_PUBLIC_OSMOSIS_RPC ?? 'https://rpc-osmosis.blockapsis.com',
    rest: process.env.NEXT_PUBLIC_OSMOSIS_REST ?? 'https://lcd-osmosis.blockapsis.com',
    swap: 'https://app.osmosis.zone',
    explorer: 'https://www.mintscan.io/osmosis',
    routes: 'https://sqs.osmosis.zone/router',
    pools: getUrl(
      process.env.NEXT_PUBLIC_OSMOSIS_REST ?? 'https://lcd-osmosis.blockapsis.com',
      'osmosis/gamm/v1beta1/pools/POOL_ID',
    ),
    dexAssets: 'https://api.astroport.fi/api/tokens?chainId=osmosis-1',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/osmosis',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  explorerName: 'Mintscan',
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.0035uosmo',
  id: ChainInfoID.Osmosis1,
  name: 'Osmosis',
  network: NETWORK.MAINNET,
  vaults: VAULTS_META_DATA,
  hls: true,
  perps: false,
  farm: true,
  anyAsset: false,
}

export default Osmosis1
