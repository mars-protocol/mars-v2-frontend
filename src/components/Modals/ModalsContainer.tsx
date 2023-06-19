import VaultModal from 'components/Modals/Vault/VaultModal'
import BorrowModal from 'components/Modals/Borrow/BorrowModal'
import FundAndWithdrawModal from 'components/Modals/FundWithdraw/FundAndWithdrawModal'
import AddVaultBorrowAssetsModal from 'components/Modals/AddVaultAssets/AddVaultBorrowAssetsModal'
import UnlockModal from 'components/Modals/Unlock/UnlockModal'

export default function ModalsContainer() {
  return (
    <>
      <BorrowModal />
      <FundAndWithdrawModal />
      <VaultModal />
      <AddVaultBorrowAssetsModal />
      <UnlockModal />
    </>
  )
}
