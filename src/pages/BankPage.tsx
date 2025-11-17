import Summary from 'components/portfolio/Account/Summary'
import BankLends from 'components/bank/BankLends'
import BankBorrowings from 'components/bank/BankBorrowings'
import BankIntro from 'components/bank/BankIntro'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'

export default function BankPage() {
  const accountId = useAccountId()
  const accountResult = useAccount(accountId || undefined)
  const account = accountResult?.data

  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <BankIntro />
      {account && <Summary account={account} />}
      <div className='grid w-full grid-cols-1 gap-2 lg:grid-cols-2'>
        <BankLends />
        <BankBorrowings />
      </div>
    </div>
  )
}
