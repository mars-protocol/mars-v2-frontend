import VaultModal from 'components/Modals/Vault'
import BorrowModal from 'components/Modals/Borrow/BorrowModal'
import FundAndWithdrawModal from 'components/Modals/FundWithdraw/FundAndWithdrawModal'
import AddVaultBorrowAssetsModal from 'components/Modals/AddVaultAssets/AddVaultBorrowAssetsModal'
import UnlockModal from 'components/Modals/Unlock/UnlockModal'
import LendAndReclaimModalController from 'components/Modals/LendAndReclaim'

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
