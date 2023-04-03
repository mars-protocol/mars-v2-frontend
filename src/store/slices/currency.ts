import { Coin } from '@cosmjs/stargate'
import { GetState, SetState } from 'zustand'

import { ASSETS } from 'constants/assets'

export interface CurrencySlice {
  displayCurrency: Asset
  prices: Coin[]
}

export function createCurrencySlice(set: SetState<CurrencySlice>, get: GetState<CurrencySlice>) {
  return {
    displayCurrency: ASSETS.find((asset) => asset.denom === 'uosmo')!,
    prices: [],
  }
}
