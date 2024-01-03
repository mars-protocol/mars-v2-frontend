import { ORACLE_DENOM } from 'constants/oracle'
import useStore from 'store'

// TODO: This does not work -> Needs to be inside a hook. Does not retrigger when changed
const enabledMarketAssets = useStore
  .getState()
  .chainConfig.assets.filter((asset) => asset.isEnabled && asset.isMarket)

export const DEFAULT_SETTINGS: Settings = {
  accountSummaryTabs: [true, true],
  reduceMotion: false,
  enableAutoLendGlobal: true,
  tradingPairSimple: {
    buy: enabledMarketAssets[0].denom,
    sell: enabledMarketAssets[1].denom,
  },
  tradingPairAdvanced: { buy: enabledMarketAssets[0].denom, sell: enabledMarketAssets[1].denom },
  displayCurrency: ORACLE_DENOM,
  slippage: 0.02,
  tutorial: true,
  migrationBanner: true,
}
