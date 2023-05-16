import BorrowModal from 'components/Modals/BorrowModal'
import FundAndWithdrawModal from 'components/Modals/FundAndWithdrawModal'
import VaultModal from 'components/Modals/VaultModal'

export default function ModalsContainer() {
  return (
    <>
      <BorrowModal />
      <FundAndWithdrawModal />
      <VaultModal />
    </>
  )
}
