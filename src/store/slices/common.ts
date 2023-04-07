import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsSwapperBaseClient } from 'types/generated/mars-swapper-base/MarsSwapperBase.client'

export interface CommonSlice {
  accounts: Account[] | null
  address?: string
  borrowModal: {
    asset: Asset
    marketData: BorrowAsset | BorrowAssetActive
    isRepay?: boolean
  } | null
  enableAnimations: boolean
  isOpen: boolean
  selectedAccount: string | null
  signingClient?: SigningCosmWasmClient
  status: WalletConnectionStatus
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    clients: {},
    creditAccounts: null,
    enableAnimations: true,
    isOpen: true,
    selectedAccount: null,
    status: WalletConnectionStatus.Unconnected,
  }
}
