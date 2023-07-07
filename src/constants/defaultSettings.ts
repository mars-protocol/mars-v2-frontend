import { ASSETS } from 'constants/assets'

export const DEFAULT_SETTINGS: SettingsSlice = {
  enableAnimations: true,
  lendAssets: true,
  preferredAsset: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
  displayCurrency: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
  slippage: 0.02,
}
