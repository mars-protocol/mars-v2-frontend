import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    addVaultBorrowingsModal: null,
    accountDeleteModal: null,
    alertDialog: null,
    borrowModal: null,
    fundAndWithdrawModal: null,
    getStartedModal: false,
    lendAndReclaimModal: null,
    resetStettingsModal: false,
    settingsModal: false,
    unlockModal: null,
    vaultModal: null,
    walletAssetsModal: null,
    withdrawFromVaultsModal: null,
    assetOverlayState: 'closed',
  }
}
