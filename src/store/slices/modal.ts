import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    addVaultBorrowingsModal: null,
    borrowModal: null,
    createAccountModal: false,
    deleteAccountModal: false,
    fundAccountModal: false,
    fundAndWithdrawModal: null,
    unlockModal: null,
    lendAndReclaimModal: null,
    vaultModal: null,
    vaultWithdrawModal: null,
  }
}
