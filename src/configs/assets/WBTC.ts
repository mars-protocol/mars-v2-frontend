import { LogoWBTC } from 'components/common/assets/AssetLogos'

const WBTC: AssetMetaData = {
  symbol: 'WBTC',
  id: 'WBTC',
  name: 'Wrapped Bitcoin',
  color: '#f09242',
  logo: LogoWBTC,
  decimals: 8,
  isTradeEnabled: true,
  hasOraclePrice: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: 'c9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
  pythFeedName: 'WBTCUSD',
}

export default WBTC
