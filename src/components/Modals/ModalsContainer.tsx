import {
  AccountDeleteController,
  AddVaultBorrowAssetsModal,
  AlertDialogController,
  BorrowModal,
  FundAndWithdrawModal,
  GetStartedModal,
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
    </>
  )
}
