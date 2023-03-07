import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { GetState, SetState } from 'zustand'
import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { getMarketAssets } from 'utils/assets'
import { formatValue } from 'utils/formatters'

export interface CommonSlice {
  address?: string
  borrowModal: boolean
  client?: WalletClient
  createAccountModal: boolean
  creditAccounts: string[] | null
  deleteAccountModal: boolean
  enableAnimations: boolean
  fundAccountModal: boolean
  isOpen: boolean
  prices: Coin[]
  repayModal: boolean
  selectedAccount: string | null
  signingClient?: SigningCosmWasmClient
  status: WalletConnectionStatus
  withdrawModal: boolean
  formatCurrency: (coin: Coin) => string
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    borrowModal: false,
    createAccountModal: false,
    clients: {},
    creditAccounts: null,
    deleteAccountModal: false,
    enableAnimations: true,
    fundAccountModal: false,
    isOpen: true,
    prices: [],
    repayModal: false,
    selectedAccount: null,
    status: WalletConnectionStatus.Unconnected,
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
