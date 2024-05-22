import { LogoAxlUSDC } from 'components/common/assets/AssetLogos'

const USDCaxl: AssetMetaData = {
  symbol: 'USDC.axl',
  name: 'Axelar USDC',
  id: 'axlUSDC',
  color: '#478edc',
  logo: LogoAxlUSDC,
  decimals: 6,
  hasOraclePrice: true,
  isDisplayCurrency: true,
  isStable: true,
  isTradeEnabled: true,
  isBorrowEnabled: true,
  isAutoLendEnabled: true,
  pythPriceFeedId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  pythFeedName: 'USDCUSD',
}

export default USDCaxl
