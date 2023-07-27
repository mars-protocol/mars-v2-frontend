import { ASSETS } from 'constants/assets'
import { ORACLE_DENOM } from 'constants/oracle'

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  lendAssets: false,
  preferredAsset: ASSETS[0].denom,
  displayCurrency: ORACLE_DENOM,
  slippage: 0.02,
}
