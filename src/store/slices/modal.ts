import { GetState, SetState } from 'zustand'

export default function createModalSlice(set: SetState<ModalSlice>, get: GetState<ModalSlice>) {
  return {
    accountDeleteModal: null,
    addFarmBorrowingsModal: null,
    alertDialog: null,
    assetOverlayState: 'closed' as OverlayState,
    hlsModal: null,
    borrowModal: null,
    fundAndWithdrawModal: null,
    getStartedModal: false,
    hlsInformationModal: null,
    hlsManageModal: null,
    hlsCloseModal: null,
    lendAndReclaimModal: null,
    perpsVaultModal: null,
    resetStettingsModal: false,
    settingsModal: false,
    unlockModal: null,
    farmModal: null,
    walletAssetsModal: null,
    withdrawFromVaultsModal: null,
    withdrawFromAstroLpModal: null,
    v1DepositAndWithdrawModal: null,
    v1BorrowAndRepayModal: null,
    keeperFeeModal: false,
    addSLTPModal: false,
  }
}
