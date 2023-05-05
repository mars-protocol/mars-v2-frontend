'use client'

import WithdrawModal from 'components/Modals//WithdrawModal'
import BorrowModal from 'components/Modals/BorrowModal'
import VaultModal from 'components/Modals/VaultModal'

export default function ModalsContainer() {
  return (
    <>
      <BorrowModal />
      <WithdrawModal />
      <VaultModal />
    </>
  )
}
