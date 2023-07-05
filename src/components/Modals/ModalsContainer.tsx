import {
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  LendAndReclaimModalController,
  UnlockModal,
  VaultModal,
  WithdrawFromVaults,
} from 'components/Modals'

export default function ModalsContainer() {
  return (
    <>
      <VaultModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <AddVaultBorrowAssetsModal />
      <UnlockModal />
      <LendAndReclaimModalController />
      <WithdrawFromVaults />
      <AlertDialogController />
    </>
  )
}
