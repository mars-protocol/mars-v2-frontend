import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    addVaultBorrowingsModal: null,
    alertDialog: null,
    borrowModal: null,
    createAccountModal: false,
    deleteAccountModal: false,
    fundAccountModal: false,
    fundAndWithdrawModal: null,
    lendAndReclaimModal: null,
    resetStettingsModal: false,
    settingsModal: false,
    unlockModal: null,
    vaultModal: null,
    walletAssetsModal: null,
    withdrawFromVaultsModal: null,
  }
}
