import { LogoUSDC } from 'components/common/assets/AssetLogos'

const USD: Asset = {
  symbol: '$',
  name: 'US Dollar',
  id: 'USD',
  denom: 'usd',
  color: '',
  logo: LogoUSDC,
  decimals: 2,
  hasOraclePrice: false,
  isEnabled: false,
  isMarket: false,
  isDisplayCurrency: true,
  isStable: false,
  forceFetchPrice: false,
}

export default USD
