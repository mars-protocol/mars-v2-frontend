import {
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  LendAndReclaimModalController,
  SettingsModal,
  UnlockModal,
  VaultModal,
  WithdrawFromVaultsModal,
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
      <WithdrawFromVaultsModal />
      <AlertDialogController />
    </>
  )
}
