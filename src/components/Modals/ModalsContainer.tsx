import FundAndWithdrawModal from 'components/Modals/FundWithdraw'
import VaultModal from 'components/Modals/Vault'

import BorrowModal from './BorrowModal'
import { AddVaultBorrowAssetsModal } from './AddVaultAssets'

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
