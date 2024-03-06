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
  PerpsVaultModal,
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
      <HlsModal />
      <HlsManageModal />
      <PerpsVaultModal />
    </>
  )
}
