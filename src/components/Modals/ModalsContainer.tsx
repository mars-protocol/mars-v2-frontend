import {
  AccountDeleteController,
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  GetStartedModal,
  HlsManageModal,
  HlsModal,
  LendAndReclaimModalController,
  SettingsModal,
  UnlockModal,
  V1BorrowAndRepay,
  V1DepositAndWithdraw,
  VaultModal,
  WalletAssets,
  WithdrawFromVaultsModal,
} from 'components/Modals'

export default function ModalsContainer() {
  return (
    <>
      <AccountDeleteController />
      <AddVaultBorrowAssetsModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <GetStartedModal />
      <LendAndReclaimModalController />
      <SettingsModal />
      <UnlockModal />
      <VaultModal />
      <WithdrawFromVaultsModal />
      <WalletAssets />
      <AlertDialogController />
      <HlsModal />
      <HlsManageModal />
      <V1DepositAndWithdraw />
      <V1BorrowAndRepay />
    </>
  )
}
