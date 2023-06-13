import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    addVaultBorrowingsModal: false,
    borrowModal: null,
    createAccountModal: false,
    deleteAccountModal: false,
    fundAccountModal: false,
    fundAndWithdrawModal: null,
    vaultModal: null,
  }
}
