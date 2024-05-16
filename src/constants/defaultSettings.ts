import { ORACLE_DENOM } from 'constants/oracle'
import useStore from 'store'
import { ResolutionString } from 'utils/charting_library'

// This does not retrigger when chains are switched. Assets might not be present on the new chain, but
// This scenario is still caught.
const enabledMarketAssets = useStore
  .getState()
  .chainConfig.assets.filter((asset) => asset.isEnabled && asset.isMarket)

export const DEFAULT_SETTINGS: Settings = {
  accountSummaryInModalTabsExpanded: [true, true, true, false],
  accountSummaryInPageTabsExpanded: [true, true, true, true],
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
  perpsAsset: '',
  updateOracle: true,
  chartInterval: '60' as ResolutionString,
  theme: 'default',
}
