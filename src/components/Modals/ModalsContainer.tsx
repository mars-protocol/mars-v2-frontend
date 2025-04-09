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
  PerpsConditionalTriggersModal,
  PerpsVaultModal,
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
      <AddFarmAssetsModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <GetStartedModal />
      <LendAndReclaimModalController />
      <SettingsModal />
      <UnlockModal />
      <AstroLpModal />
      <VaultModal />
      <WithdrawFromVaultsModal />
      <WalletAssets />
      <AlertDialogController />
      <HlsModal />
      <HlsCloseModal />
      <HlsManageModal />
      <PerpsVaultModal />
      <V1DepositAndWithdraw />
      <V1BorrowAndRepay />
      <KeeperFeeModal />
      <PerpsConditionalTriggersModal />
    </>
  )
}
