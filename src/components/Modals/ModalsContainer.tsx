import BorrowModal from 'components/Modals/BorrowModal'
import FundAndWithdrawModal from 'components/Modals/fundwithdraw/FundAndWithdrawModal'
import VaultModal from 'components/Modals/vault/VaultModal'

export default function ModalsContainer() {
  return (
    <>
      <BorrowModal />
      <FundAndWithdrawModal />
      <VaultModal />
    </>
  )
}
