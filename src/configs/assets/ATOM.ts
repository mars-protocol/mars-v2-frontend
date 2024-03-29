import { LogoATOM } from 'components/common/assets/AssetLogos'

const ATOM: AssetMetaData = {
  symbol: 'ATOM',
  name: 'Atom',
  id: 'ATOM',

  color: '#6f7390',
  logo: LogoATOM,
  decimals: 6,
  hasOraclePrice: true,
  isEnabled: true,
  isMarket: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  pythFeedName: 'ATOMUSD',
}

export default ATOM
