import { LogoWstETH } from 'components/common/assets/AssetLogos'

const wstETH: AssetMetaData = {
  symbol: 'wstETH',
  id: 'wstETH',
  name: 'Lido Wrapped Staked Ethereum',
  color: '#00a3ff',
  logo: LogoWstETH,
  decimals: 18,
  isMarket: true,
  hasOraclePrice: true,
  isDisplayCurrency: true,
  isAutoLendEnabled: true,
  isBorrowEnabled: true,
  pythPriceFeedId: '0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784',
  pythFeedName: 'WSTETHUSD',
}

export default wstETH
