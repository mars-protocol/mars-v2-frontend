import { ORACLE_DENOM } from 'constants/oracle'
import useStore from 'store'
import { ResolutionString } from 'utils/charting_library'

// This does not retrigger when chains are switched. Assets might not be present on the new chain, but
// This scenario is still caught.
const defaultTradingPair = useStore.getState().chainConfig.defaultTradingPair

export const DEFAULT_SETTINGS: Settings = {
  accountSummaryTabsExpanded: [true, true, true, true],
  accountSummaryInModalTabsExpanded: [true, true, true, false],
  reduceMotion: false,
  enableAutoLendGlobal: true,
  tradingPairSimple: defaultTradingPair,
  tradingPairAdvanced: defaultTradingPair,
  displayCurrency: ORACLE_DENOM,
  slippage: 0.02,
  tutorial: true,
  migrationBanner: true,
  perpsAsset: '',
  updateOracle: true,
  chartInterval: '60' as ResolutionString,
  theme: 'default',
}
