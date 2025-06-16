import { StoreApi } from 'zustand'

export default function createModalSlice(
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
) {
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
    settingsModal: false,
    unlockModal: null,
    farmModal: null,
    walletAssetsModal: null,
    withdrawFromVaultsModal: null,
    v1DepositAndWithdrawModal: null,
    v1BorrowAndRepayModal: null,
    keeperFeeModal: false,
    addSLTPModal: false,
    vaultAssetsModal: null,
    marsStakingModal: null,
  }
}
