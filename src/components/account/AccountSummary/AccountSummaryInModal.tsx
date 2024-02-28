import AccountSummary from 'components/account/AccountSummary'
import Card from 'components/common/Card'

interface Props {
  account: Account
  isHls?: boolean
}

export default function AccountSummaryInModal(props: Props) {
  const { account, isHls } = props

  return (
    <div className='h-[546px] max-w-screen-full overflow-y-scroll scrollbar-hide'>
      <Card className='w-94'>
        <AccountSummary account={account} isHls={isHls} />
      </Card>
    </div>
  )
}
