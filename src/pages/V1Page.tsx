import Summary from 'components/portfolio/Account/Summary'
import Borrowings from 'components/v1/Borrowings'
import Deposits from 'components/v1/Deposits'
import V1Intro from 'components/v1/V1Intro'
import useV1Account from 'hooks/v1/useV1Account'

export default function V1Page() {
  const { data: account } = useV1Account()

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <V1Intro />
      {account && <Summary account={account} v1 />}
      <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2'>
        <Deposits />
        <Borrowings />
      </div>
    </div>
  )
}
