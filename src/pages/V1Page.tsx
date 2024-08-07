import Summary from 'components/portfolio/Account/Summary'
import Borrowings from 'components/v1/Borrowings'
import Deposits from 'components/v1/Deposits'
import V1Intro from 'components/v1/V1Intro'
import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'

export default function V1Page() {
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(address)

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <V1Intro />
      {account && address && <Summary account={account} v1 />}
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2'>
        <Deposits />
        <Borrowings />
      </div>
    </div>
  )
}
