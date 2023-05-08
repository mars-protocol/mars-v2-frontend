import { GetState, SetState } from 'zustand'

import { ASSETS } from 'constants/assets'

export default function createCurrencySlice(
  set: SetState<CurrencySlice>,
  get: GetState<CurrencySlice>,
) {
  return {
    baseCurrency: ASSETS[0],
    displayCurrency: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
    prices: [],
  }
}
