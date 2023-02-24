import { GetState, SetState } from 'zustand'

export interface CommonSlice {
  createAccountModal: boolean
  deleteAccountModal: boolean
  enableAnimations: boolean
  fundAccountModal: boolean
  isOpen: boolean
  selectedAccount: string | null
  withdrawModal: boolean
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    createAccountModal: false,
    deleteAccountModal: false,
    enableAnimations: true,
    fundAccountModal: false,
    isOpen: true,
    selectedAccount: null,
    withdrawModal: false,
  }
}
