import {
  AccountDeleteController,
  AddFarmAssetsModal,
  AlertDialogController,
  AstroLpModal,
  BorrowModal,
  FundAndWithdrawModal,
  GetStartedModal,
  HlsCloseModal,
  HlsManageModal,
  HlsModal,
  KeeperFeeModal,
  LendAndReclaimModalController,
  PerpsVaultModal,
  SettingsModal,
  UnlockModal,
  V1BorrowAndRepay,
  V1DepositAndWithdraw,
  VaultAssets,
  VaultModal,
  WalletAssets,
  WithdrawFromVaultsModal,
} from 'components/Modals'
import useStore from 'store'

export default function ModalsContainer() {
  const store = useStore((s) => s)

  return (
    <>
      {store.accountDeleteModal && <AccountDeleteController />}
      {store.farmModal && <AddFarmAssetsModal />}
      {store.borrowModal && <BorrowModal />}
      {store.fundAndWithdrawModal && <FundAndWithdrawModal />}
      {store.getStartedModal && <GetStartedModal />}
      {store.lendAndReclaimModal && <LendAndReclaimModalController />}
      {store.settingsModal && <SettingsModal />}
      {store.unlockModal && <UnlockModal />}
      {store.farmModal && <AstroLpModal />}
      {store.farmModal && <VaultModal />}
      {store.withdrawFromVaultsModal && <WithdrawFromVaultsModal />}
      {store.walletAssetsModal && <WalletAssets />}
      <AlertDialogController />
      {store.hlsModal && <HlsModal />}
      {store.hlsCloseModal && <HlsCloseModal />}
      {store.hlsManageModal && <HlsManageModal />}
      {store.perpsVaultModal && <PerpsVaultModal />}
      {store.v1DepositAndWithdrawModal && <V1DepositAndWithdraw />}
      {store.v1BorrowAndRepayModal && <V1BorrowAndRepay />}
      {store.keeperFeeModal && <KeeperFeeModal />}
      {store.vaultAssetsModal && <VaultAssets />}
    </>
  )
}
