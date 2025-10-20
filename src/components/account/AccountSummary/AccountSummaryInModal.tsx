import AccountSummary from 'components/account/AccountSummary'
import Card from 'components/common/Card'

interface Props {
  account: Account
}

export default function AccountSummaryInModal(props: Props) {
  const { account } = props
  const isHls = account.kind === 'high_levered_strategy'

  return (
    <div className='md:h-[546px] max-w-screen-full overflow-y-scroll scrollbar-hide'>
      <Card
        className='w-full max-w-screen-full md:w-105'
        contentClassName='scrollbar-hide overflow-y-scroll '
      >
        <AccountSummary account={account} isInModal />
      </Card>
    </div>
  )
}
