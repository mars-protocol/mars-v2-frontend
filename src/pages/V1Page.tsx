import MigrationBanner from 'components/common/MigrationBanner'
import Borrowings from 'components/v1/Borrowings'
import Deposits from 'components/v1/Deposits'
import V1Intro from 'components/v1/V1Intro'

export default function V1Page() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <V1Intro />
      <Deposits />
      <Borrowings />
    </div>
  )
}
