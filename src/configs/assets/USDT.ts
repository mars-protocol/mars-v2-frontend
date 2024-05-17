import { LogoUSDT } from 'components/common/assets/AssetLogos'

const USDT: AssetMetaData = {
  symbol: 'USDT',
  id: 'USDT',
  name: 'Tether',
  color: '#50af95',
  logo: LogoUSDT,
  decimals: 6,
  isMarket: true,
  hasOraclePrice: true,
  isDisplayCurrency: true,
  isStable: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: '2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  pythFeedName: 'USDTUSD',
}

export default USDT
