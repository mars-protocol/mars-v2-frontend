import Borrowings from 'components/Borrow/Borrowings'
import BorrowIntro from 'components/Borrow/BorrowIntro'
import MigrationBanner from 'components/MigrationBanner'

export default function BorrowPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <BorrowIntro />
      <Borrowings />
    </div>
  )
}
