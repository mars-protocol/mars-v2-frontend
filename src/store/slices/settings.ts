import { GetState, SetState } from 'zustand'

import { ASSETS } from 'constants/assets'

export default function createSettingsSlice(
  set: SetState<CommonSlice>,
  get: GetState<CommonSlice>,
) {
  return {
    enableAnimations: true,
    lendAssets: true,
    preferredAsset: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
    displayCurrency: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
    slippage: 0.02,
  }
}
