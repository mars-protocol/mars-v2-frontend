import { ASSETS } from 'constants/assets'

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  lendAssets: false,
  preferredAsset: ASSETS[0].denom,
  displayCurrency: ASSETS[0].denom,
  slippage: 0.02,
}
