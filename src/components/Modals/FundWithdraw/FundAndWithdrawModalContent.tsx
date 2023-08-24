import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import FundAccount from 'components/Modals/FundWithdraw/FundAccount'
import WithdrawFromAccount from 'components/Modals/FundWithdraw/WithdrawFromAccount'

interface Props {
  account: Account
  isFunding: boolean
}

export default function FundWithdrawModalContent(props: Props) {
  const { account, isFunding } = props
  const [change, setChange] = useState<AccountChange | undefined>()
  const [updatedAccount, setUpdatedAccount] = useState<Account | undefined>()

  return (
    <div className='flex items-start flex-1 gap-6 p-6'>
      <Card
        className='flex flex-1 p-4 bg-white/5'
        contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
      >
        {isFunding ? (
          <FundAccount account={account} setUpdatedAccount={setUpdatedAccount} />
        ) : (
          <WithdrawFromAccount account={account} setUpdatedAccount={setUpdatedAccount} />
        )}
      </Card>
      <AccountSummary account={account} updatedAccount={updatedAccount} />
    </div>
  )
}
