import MigrationBanner from 'components/common/MigrationBanner'
import Summary from 'components/portfolio/Account/Summary'
import Borrowings from 'components/v1/Borrowings'
import Deposits from 'components/v1/Deposits'
import V1Intro from 'components/v1/V1Intro'
import useStore from 'store'

export default function V1Page() {
  const address = useStore((s) => s.address)
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <V1Intro />
      {address && <Summary accountId={address} v1 />}
      <Deposits />
      <Borrowings />
    </div>
  )
}
