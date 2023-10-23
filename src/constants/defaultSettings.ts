import { ASSETS } from 'constants/assets'
import { ORACLE_DENOM } from 'constants/oracle'

export const DEFAULT_SETTINGS: Settings = {
  accountSummaryTabs: [true, true],
  reduceMotion: false,
  lendAssets: true,
  preferredAsset: ASSETS[0].denom,
  displayCurrency: ORACLE_DENOM,
  slippage: 0.02,
  tutorial: true,
  migrationBanner: true,
}
