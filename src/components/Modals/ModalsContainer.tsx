import FundAndWithdrawModal from 'components/modals/FundWithdraw'
import VaultModal from 'components/modals/Vault'

import { AddVaultBorrowAssetsModal } from './AddVaultAssets'
import BorrowModal from './BorrowModal'

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
