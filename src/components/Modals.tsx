'use client'

import { ConfirmModal } from 'components/Account/ConfirmModal'
import { FundAccountModal } from 'components/Account/FundAccountModal'
import BorrowModal from 'components/BorrowModal'

export const Modals = () => (
  <>
    <FundAccountModal />
    {/* <WithdrawModal /> */}
    <ConfirmModal />
    <BorrowModal />
  </>
)
