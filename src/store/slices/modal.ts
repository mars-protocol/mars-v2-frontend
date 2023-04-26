import { GetState, SetState } from 'zustand'

export interface ModalSlice {
  borrowModal: {
    asset: Asset
    marketData: BorrowAsset | BorrowAssetActive
    isRepay?: boolean
  } | null
  createAccountModal: boolean
  deleteAccountModal: boolean
  fundAccountModal: boolean
  withdrawModal: boolean
  vaultModal: {
    vault: Vault
  } | null
}

export function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    borrowModal: null,
    createAccountModal: false,
    deleteAccountModal: false,
    fundAccountModal: false,
    withdrawModal: false,
    vaultModal: null,
  }
}
