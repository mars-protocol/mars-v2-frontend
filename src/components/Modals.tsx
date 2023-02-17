import { ConfirmModal } from 'components/Account/ConfirmModal'
import { FundAccountModal } from 'components/Account/FundAccountModal'
import { WithdrawModal } from 'components/Account/WithdrawModal'

export const Modals = () => (
  <>
    <FundAccountModal />
    <WithdrawModal />
    <ConfirmModal />
  </>
)
