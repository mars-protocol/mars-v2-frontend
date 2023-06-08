import BorrowModal from 'components/modals/BorrowModal'
import FundAndWithdrawModal from 'components/modals/FundWithdraw'
import VaultModal from 'components/modals/Vault'

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
