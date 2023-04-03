import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Coin } from '@cosmjs/stargate'
import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import { GetState, SetState } from 'zustand'

import { ENV } from 'constants/env'
import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsSwapperBaseClient } from 'types/generated/mars-swapper-base/MarsSwapperBase.client'
import { getMarketAssets } from 'utils/assets'
import { formatValue } from 'utils/formatters'

export interface CommonSlice {
  address?: string
  borrowModal: {
    asset: Asset
    marketData: BorrowAsset | BorrowAssetActive
    isRepay?: boolean
  } | null
  client?: WalletClient
  clients: {
    accountNft?: MarsAccountNftClient
    creditManager?: MarsCreditManagerClient
    swapperBase?: MarsSwapperBaseClient
  }
  createAccountModal: boolean
  creditAccounts: string[] | null
  selectedAccountDetails?: Position
  deleteAccountModal: boolean
  enableAnimations: boolean
  fundAccountModal: boolean
  isOpen: boolean
  prices: Coin[]
  selectedAccount: string | null
  signingClient?: SigningCosmWasmClient
  status: WalletConnectionStatus
  withdrawModal: boolean
  formatCurrency: (coin: Coin) => string
  initClients: (address: string, signingClient: SigningCosmWasmClient) => void
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    borrowModal: null,
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
    initClients: (address: string, signingClient: SigningCosmWasmClient) => {
      if (!signingClient) return
      const accountNft = new MarsAccountNftClient(
        signingClient,
        address,
        ENV.ADDRESS_ACCOUNT_NFT || '',
      )
      const creditManager = new MarsCreditManagerClient(
        signingClient,
        address,
        ENV.ADDRESS_CREDIT_MANAGER || '',
      )
      const swapperBase = new MarsSwapperBaseClient(
        signingClient,
        address,
        ENV.ADDRESS_SWAPPER || '',
      )

      set(() => ({
        clients: {
          accountNft,
          creditManager,
          swapperBase,
        },
      }))
    },
  }
}
