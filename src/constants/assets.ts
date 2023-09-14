import { IS_TESTNET } from 'constants/env'

export const MARS_MAINNET_DENOM =
  'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580'

export const ASSETS: Asset[] = [
  {
    symbol: 'OSMO',
    name: 'Osmosis',
    id: 'OSMO',
    denom: 'uosmo',
    mainnetDenom: 'uosmo',
    color: '#9f1ab9',
    decimals: 6,
    hasOraclePrice: true,
    logo: '/images/tokens/osmo.svg',
    isEnabled: true,
    isMarket: true,
    isDisplayCurrency: true,
    isAutoLendEnabled: true,
    pythPriceFeedId: '5867f5683c757393a0670ef0f701490950fe93fdb006d181c8265a831ac0c5c6',
  },
  {
    symbol: 'ATOM',
    name: 'Atom',
    id: 'ATOM',
    denom: IS_TESTNET
      ? 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477'
      : 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    mainnetDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: '#6f7390',
    logo: '/images/tokens/atom.svg',
    decimals: 6,
    hasOraclePrice: true,
    isEnabled: true,
    isMarket: true,
    isDisplayCurrency: true,
    isAutoLendEnabled: true,
    pythPriceFeedId: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
    poolId: 1,
  },
  {
    symbol: 'stATOM',
    name: 'Stride Atom',
    id: 'stATOM',
    denom: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
    mainnetDenom: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
    color: '#e50571',
    logo: '/images/tokens/statom.svg',
    decimals: 6,
    hasOraclePrice: !IS_TESTNET,
    isEnabled: !IS_TESTNET,
    isMarket: !IS_TESTNET,
    isDisplayCurrency: !IS_TESTNET,
    isAutoLendEnabled: true,
    poolId: 803,
  },
  {
    symbol: 'WBTC.axl',
    id: 'axlWBTC',
    name: 'Axelar Wrapped Bitcoin',
    denom: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
    mainnetDenom: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
    color: '#f09242',
    logo: '/images/tokens/axlwbtc.svg',
    decimals: 8,
    hasOraclePrice: true,
    isEnabled: !IS_TESTNET,
    isMarket: !IS_TESTNET,
    isDisplayCurrency: !IS_TESTNET,
    isAutoLendEnabled: true,
    pythPriceFeedId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    poolId: 712,
  },
  {
    symbol: 'WETH.axl',
    id: 'axlWETH',
    name: 'Axelar Wrapped Ethereum',
    denom: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
    mainnetDenom: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
    color: '#343434',
    logo: '/images/tokens/axlweth.svg',
    decimals: 18,
    hasOraclePrice: true,
    isEnabled: !IS_TESTNET,
    isMarket: !IS_TESTNET,
    isDisplayCurrency: !IS_TESTNET,
    isAutoLendEnabled: true,
    pythPriceFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    poolId: 704,
  },
  {
    symbol: 'MARS',
    name: 'Mars',
    id: 'MARS',
    denom: IS_TESTNET
      ? 'ibc/DB9D326CF53EA07610C394D714D78F8BB4DC7E312D4213193791A9046BF45E20'
      : MARS_MAINNET_DENOM,
    mainnetDenom: MARS_MAINNET_DENOM,
    color: '#a03b45',
    logo: '/images/tokens/mars.svg',
    decimals: 6,
    poolId: 907,
    hasOraclePrice: false,
    isMarket: false,
    isEnabled: true,
    forceFetchPrice: true,
  },
  {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    id: 'axlUSDC',
    denom: IS_TESTNET
      ? 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE'
      : 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    mainnetDenom: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    color: '#478edc',
    logo: '/images/tokens/axlusdc.svg',
    decimals: 6,
    hasOraclePrice: true,
    isEnabled: true,
    isMarket: true,
    isDisplayCurrency: true,
    isStable: true,
    isAutoLendEnabled: true,
    pythPriceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    poolId: 678,
  },
  {
    symbol: 'AXL',
    name: 'Axelar',
    id: 'AXL',
    denom: 'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E',
    mainnetDenom: 'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E',
    color: '#FFF',
    logo: '/images/tokens/axl.svg',
    decimals: 6,
    hasOraclePrice: true,
    isEnabled: !IS_TESTNET,
    isMarket: !IS_TESTNET,
    isDisplayCurrency: !IS_TESTNET,
    isAutoLendEnabled: true,
    pythPriceFeedId: '60144b1d5c9e9851732ad1d9760e3485ef80be39b984f6bf60f82b28a2b7f126',
    poolId: 812,
  },
  {
    symbol: '$',
    name: 'US Dollar',
    id: 'USD',
    denom: 'usd',
    mainnetDenom: 'usd',
    color: '',
    logo: '',
    decimals: 2,
    hasOraclePrice: false,
    isEnabled: false,
    isMarket: false,
    isDisplayCurrency: true,
    isStable: false,
    forceFetchPrice: false,
  },
  {
    symbol: 'OSMO-ATOM',
    name: 'OSMO-ATOM LP',
    id: IS_TESTNET ? 'gamm/pool/12' : 'gamm/pool/1',
    denom: IS_TESTNET ? 'gamm/pool/12' : 'gamm/pool/1',
    mainnetDenom: IS_TESTNET ? 'gamm/pool/12' : 'gamm/pool/1',
    color: '',
    logo: '',
    decimals: 6,
    isEnabled: false,
    isMarket: false,
    hasOraclePrice: true,
    forceFetchPrice: true,
  },
  {
    symbol: 'OSMO-USDC.axl',
    name: 'OSMO-USDC.axl LP',
    id: 'gamm/pool/678',
    denom: 'gamm/pool/678',
    mainnetDenom: 'gamm/pool/678',
    color: '',
    logo: '',
    decimals: 6,
    isEnabled: false,
    isMarket: false,
    hasOraclePrice: !IS_TESTNET,
    forceFetchPrice: !IS_TESTNET,
  },
  {
    symbol: 'OSMO-WETH.axl',
    name: 'OSMO-WETH.axl LP',
    id: 'gamm/pool/704',
    denom: 'gamm/pool/704',
    mainnetDenom: 'gamm/pool/704',
    color: '',
    logo: '',
    decimals: 6,
    isEnabled: false,
    isMarket: false,
    hasOraclePrice: !IS_TESTNET,
    forceFetchPrice: !IS_TESTNET,
  },
  {
    symbol: 'OSMO-WBTC.axl',
    name: 'OSMO-WBTC.axl LP',
    id: 'gamm/pool/712',
    denom: 'gamm/pool/712',
    mainnetDenom: 'gamm/pool/712',
    color: '',
    logo: '',
    decimals: 6,
    isEnabled: false,
    isMarket: false,
    hasOraclePrice: !IS_TESTNET,
    forceFetchPrice: !IS_TESTNET,
  },
  {
    symbol: 'stATOM-ATOM',
    name: 'stATOM-ATOM LP',
    id: 'gamm/pool/803',
    denom: 'gamm/pool/803',
    mainnetDenom: 'gamm/pool/803',
    color: '',
    logo: '',
    decimals: 6,
    isEnabled: false,
    isMarket: false,
    hasOraclePrice: !IS_TESTNET,
    forceFetchPrice: !IS_TESTNET,
  },
]
