import { LogoDYDX } from 'components/common/assets/AssetLogos'

const DYDX: AssetMetaData = {
  symbol: 'DYDX',
  id: 'DYDX',
  name: 'dYdX',
  color: '#6966ff',
  logo: LogoDYDX,
  decimals: 18,
  hasOraclePrice: true,
  isEnabled: true,
  isMarket: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: '6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b',
  pythFeedName: 'DYDXUSD',
}

export default DYDX
