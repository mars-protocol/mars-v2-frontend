import { IS_TESTNET } from 'constants/env'

export const ASSETS: Asset[] = [
  {
    symbol: 'OSMO',
    name: 'Osmosis',
    denom: 'uosmo',
    color: '#9f1ab9',
    decimals: 6,
    hasOraclePrice: true,
    logo: '/tokens/osmo.svg',
    isEnabled: true,
    isMarket: true,
    isDisplayCurrency: true,
  },
  {
    symbol: 'ATOM',
    name: 'Atom',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: '#6f7390',
    logo: '/tokens/atom.svg',
    decimals: 6,
    hasOraclePrice: true,
    isEnabled: !IS_TESTNET,
    isMarket: true,
    isDisplayCurrency: true,
  },
  {
    symbol: 'MARS',
    name: 'Mars',
    denom: IS_TESTNET
      ? 'ibc/ACA4C8A815A053CC027DB90D15915ADA31939FA331CE745862CDD00A2904FA17'
      : 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580',
    color: '#dd5b65',
    logo: '/tokens/mars.svg',
    decimals: 6,
    poolId: IS_TESTNET ? 768 : 907,
    hasOraclePrice: true,
    isMarket: false,
    isEnabled: true,
  },
  {
    symbol: 'USDC.axl',
    name: 'Axelar USDC',
    denom: IS_TESTNET
      ? 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE'
      : 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
    color: '#478edc',
    logo: '/tokens/axlusdc.svg',
    decimals: 6,
    hasOraclePrice: true,
    isEnabled: true,
    isMarket: !IS_TESTNET,
    isDisplayCurrency: true,
  },
]
