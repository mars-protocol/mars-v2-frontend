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

  return (
    <div className='flex flex-1 items-start gap-6 p-6'>
      <Card
        className='flex flex-1 bg-white/5 p-4'
        contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
      >
        {isFunding ? (
          <FundAccount account={account} setChange={setChange} />
        ) : (
          <WithdrawFromAccount account={account} setChange={setChange} />
        )}
      </Card>
      <AccountSummary account={account} change={change} />
    </div>
  )
}
