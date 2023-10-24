import { ORACLE_DENOM } from 'constants/oracle'
import { getEnabledMarketAssets } from 'utils/assets'

const enabledMarketAssets = getEnabledMarketAssets()

export const DEFAULT_SETTINGS: Settings = {
  accountSummaryTabs: [true, true],
  reduceMotion: false,
  lendAssets: true,
  tradingPair: [enabledMarketAssets[0].denom, enabledMarketAssets[1].denom],
  displayCurrency: ORACLE_DENOM,
  slippage: 0.02,
  tutorial: true,
  migrationBanner: true,
}
