import AddVaultBorrowAssetsModal from 'components/Modals/AddVaultAssets/AddVaultBorrowAssetsModal'
import BorrowModal from 'components/Modals/Borrow/BorrowModal'
import FundAndWithdrawModal from 'components/Modals/FundWithdraw/FundAndWithdrawModal'
import LendAndReclaimModalController from 'components/Modals/LendAndReclaim'
import UnlockModal from 'components/Modals/Unlock/UnlockModal'
import VaultModal from 'components/Modals/Vault'

export default function ModalsContainer() {
  return (
    <>
      <VaultModal />
      <BorrowModal />
      <FundAndWithdrawModal />
      <AddVaultBorrowAssetsModal />
      <UnlockModal />
      <LendAndReclaimModalController />
    </>
  )
}
