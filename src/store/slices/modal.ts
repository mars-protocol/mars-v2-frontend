import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    accountDeleteModal: null,
    addVaultBorrowingsModal: null,
    alertDialog: null,
    assetOverlayState: 'closed' as OverlayState,
    hlsModal: null,
    borrowModal: null,
    fundAndWithdrawModal: null,
    getStartedModal: false,
    hlsInformationModal: null,
    lendAndReclaimModal: null,
    resetStettingsModal: false,
    settingsModal: false,
    unlockModal: null,
    vaultModal: null,
    walletAssetsModal: null,
    withdrawFromVaultsModal: null,
  }
}
