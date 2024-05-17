import { LogoOSMO } from 'components/common/assets/AssetLogos'

const OSMO: AssetMetaData = {
  symbol: 'OSMO',
  name: 'Osmosis',
  id: 'OSMO',
  color: '#9f1ab9',
  decimals: 6,
  hasOraclePrice: true,
  logo: LogoOSMO,
  isMarket: true,
  isBorrowEnabled: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  pythPriceFeedId: '5867f5683c757393a0670ef0f701490950fe93fdb006d181c8265a831ac0c5c6',
  pythFeedName: 'OSMOUSD',
}

export default OSMO
