import { LogoAxlWETH } from 'components/common/assets/AssetLogos'

const WETHaxl: AssetMetaData = {
  symbol: 'WETH.axl',
  id: 'axlWETH',
  name: 'Axelar Wrapped Ethereum',
  color: '#343434',
  logo: LogoAxlWETH,
  decimals: 18,
  hasOraclePrice: true,
  isEnabled: true,
  isMarket: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  pythFeedName: 'ETHUSD',
}

export default WETHaxl
