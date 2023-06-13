import FundAndWithdrawModal from 'components/Modals/FundWithdraw/Modal'
import VaultModal from 'components/Modals/Vault/Modal'

import BorrowModal from './Borrow/Modal'
import { AddVaultBorrowAssetsModal } from './AddVaultAssets/Modal'

export default function ModalsContainer() {
  return (
    <>
      <BorrowModal />
      <FundAndWithdrawModal />
      <VaultModal />
      <AddVaultBorrowAssetsModal />
    </>
  )
}
