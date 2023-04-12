import { Coin } from '@cosmjs/stargate'
import { GetState, SetState } from 'zustand'

import { ASSETS } from 'constants/assets'

export interface CurrencySlice {
  baseCurrency: Asset
  displayCurrency: Asset
  prices: Coin[]
}

export function createCurrencySlice(set: SetState<CurrencySlice>, get: GetState<CurrencySlice>) {
  return {
    baseCurrency: ASSETS[0],
    displayCurrency: ASSETS.find((asset) => asset.denom === ASSETS[0].denom)!,
    prices: [],
  }
}
