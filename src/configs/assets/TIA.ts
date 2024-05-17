import { LogoTIA } from 'components/common/assets/AssetLogos'

const TIA: AssetMetaData = {
  symbol: 'TIA',
  id: 'TIA',
  name: 'Celestia',
  color: '#8623ff',
  logo: LogoTIA,
  decimals: 6,
  isMarket: true,
  hasOraclePrice: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: '09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723',
  pythFeedName: 'TIAUSD',
}

export default TIA
