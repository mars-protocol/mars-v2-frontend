import Borrowings from 'components/borrow/Borrowings'
import BorrowIntro from 'components/borrow/BorrowIntro'
import MigrationBanner from 'components/common/MigrationBanner'

export default function BorrowPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <BorrowIntro />
      <Borrowings />
    </div>
  )
}
