import { Bech32Address } from '@keplr-wallet/cosmos'

import AKT from 'configs/assets/AKT'
import ATOM from 'configs/assets/ATOM'
import AXL from 'configs/assets/AXL'
import DYDX from 'configs/assets/DYDX'
import INJ from 'configs/assets/INJ'
import OSMO_ATOM from 'configs/assets/lp/OSMO-ATOM'
import OSMO_USDC from 'configs/assets/lp/OSMO_USDC'
import OSMO_WBTC from 'configs/assets/lp/OSMO_WBTC'
import OSMO_WETH from 'configs/assets/lp/OSMO_WETH'
import stATOM_ATOM from 'configs/assets/lp/stATOM_ATOM'
import MARS from 'configs/assets/MARS'
import OSMO from 'configs/assets/OSMO'
import stATOM from 'configs/assets/stATOM'
import stOSMO from 'configs/assets/stOSMO'
import TIA from 'configs/assets/TIA'
import USDC from 'configs/assets/USDC'
import USDCaxl from 'configs/assets/USDC.axl'
import USDollar from 'configs/assets/USDollar'
import USDT from 'configs/assets/USDT'
import WBTCaxl from 'configs/assets/WBTC.axl'
import WETHaxl from 'configs/assets/WETH.xal'
import { VAULTS_META_DATA } from 'constants/vaults'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

const ASSETS = [
  { ...OSMO, denom: 'uosmo' },
  USDollar,
  {
    ...USDC,
    poolId: 1221,
    denom: 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
  },
  {
    ...ATOM,
    poolId: 1,
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
  },
  {
    ...WBTCaxl,
    poolId: 712,
    denom: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
  },
  {
    ...stOSMO,
    poolId: 833,
    denom: 'ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC',
  },
  {
    ...stATOM,
    poolId: 803,
    denom: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
  },
  {
    ...USDCaxl,
    poolId: 678,
    denom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
  },
  {
    ...WETHaxl,
    poolId: 704,
    denom: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
  },
  {
    ...AKT,
    poolId: 1093,
    denom: 'ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4',
  },
  {
    ...MARS,
    poolId: 907,
    denom: 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580',
  },
  {
    ...USDT,
    poolId: 1077,
    denom: 'ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB',
  },
  {
    ...AXL,
    poolId: 812,
    denom: 'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E',
  },
  {
    ...INJ,
    poolId: 725,
    denom: 'ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273',
  },
  {
    ...TIA,
    poolId: 1249,
    denom: 'ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877',
  },
  {
    ...DYDX,
    poolId: 1245,
    denom: 'ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C',
  },
  OSMO_ATOM,
  OSMO_USDC,
  OSMO_WETH,
  OSMO_WBTC,
  stATOM_ATOM,
]

const Osmosis1: ChainConfig = {
  assets: ASSETS,
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
      low: 0,
      average: 0.025,
      high: 0.04,
    },
  },
  endpoints: {
    rpc: 'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-rpc-front/',
    rest: 'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-lcd-front/',
    swap: 'https://app.osmosis.zone',
    pyth: 'https://hermes.pyth.network/api',
    pythCandles: 'https://benchmarks.pyth.network',
    graphCandles: 'https://osmosis-candles.marsprotocol.io',
    explorer: 'https://www.mintscan.io/osmosis/transactions/',
    pools:
      (process.env.NEXT_PUBLIC_OSMOSIS_REST ||
        'https://osmosis-node.marsprotocol.io/GGSFGSFGFG34/osmosis-lcd-front/') +
      'osmosis/gamm/v1beta1/pools/POOL_ID',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/osmosis',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  explorerName: 'Mintscan',
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025uosmo',
  id: ChainInfoID.Osmosis1,
  name: 'Osmosis',
  network: NETWORK.MAINNET,
  vaults: VAULTS_META_DATA,
  hls: true,
  perps: false,
  farm: true,
}

export default Osmosis1
