import {
  AccountDeleteModal,
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  LendAndReclaimModalController,
  SettingsModal,
  UnlockModal,
  VaultModal,
  WalletAssets,
  WithdrawFromVaultsModal,
} from 'components/Modals'

export default function ModalsContainer() {
  return (
    <>
      <AccountDeleteModal />
      <AddVaultBorrowAssetsModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <LendAndReclaimModalController />
      <SettingsModal />
      <UnlockModal />
      <VaultModal />
      <WithdrawFromVaultsModal />
      <WalletAssets />
      <AlertDialogController />
    </>
  )
}
