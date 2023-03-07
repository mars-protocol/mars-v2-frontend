import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { GetState, SetState } from 'zustand'

import { getMarketAssets } from 'utils/assets'
import { formatValue } from 'utils/formatters'

export interface CommonSlice {
  borrowModal: boolean
  createAccountModal: boolean
  deleteAccountModal: boolean
  enableAnimations: boolean
  repayModal: boolean
  fundAccountModal: boolean
  prices: Coin[]
  creditAccounts: string[] | null
  isOpen: boolean
  selectedAccount: string | null
  withdrawModal: boolean
  formatCurrency: (coin: Coin) => string
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    borrowModal: false,
    createAccountModal: false,
    deleteAccountModal: false,
    repayModal: false,
    enableAnimations: true,
    fundAccountModal: false,
    prices: [],
    creditAccounts: null,
    isOpen: true,
    selectedAccount: null,
    withdrawModal: false,
    formatCurrency: (coin: Coin) => {
      const price = get().prices.find((price) => price.denom === coin.denom)
      const marketAsset = getMarketAssets().find((asset) => asset.denom === coin.denom)

      if (!price || !marketAsset) return ''

      return formatValue(
        new BigNumber(coin.amount)
          .times(price.amount)
          .dividedBy(10 ** marketAsset.decimals)
          .toNumber(),
        {
          minDecimals: 0,
          prefix: '$',
        },
      )
    },
  }
}
