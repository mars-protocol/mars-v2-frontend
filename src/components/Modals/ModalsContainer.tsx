import {
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  LendAndReclaimModalController,
  SettingsModal,
  UnlockModal,
  VaultModal,
  WithdrawFromVaults,
} from 'components/Modals'

export default function ModalsContainer() {
  return (
    <>
      <AddVaultBorrowAssetsModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <LendAndReclaimModalController />
      <SettingsModal />
      <UnlockModal />
      <VaultModal />
      <WithdrawFromVaults />
      <AlertDialogController />
    </>
  )
}
