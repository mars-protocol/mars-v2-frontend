import {
  AccountDeleteController,
  AddLiquidityPoolAssetsModal,
  AlertDialogController,
  BorrowModal,
  FarmModal,
  FundAndWithdrawModal,
  GetStartedModal,
  HlsManageModal,
  HlsModal,
  LendAndReclaimModalController,
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
      <AddLiquidityPoolAssetsModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <GetStartedModal />
      <LendAndReclaimModalController />
      <SettingsModal />
      <UnlockModal />
      <FarmModal />
      <VaultModal />
      <WithdrawFromVaultsModal />
      <WalletAssets />
      <AlertDialogController />
      <HlsModal />
      <HlsManageModal />
      <PerpsVaultModal />
      <V1DepositAndWithdraw />
      <V1BorrowAndRepay />
    </>
  )
}
