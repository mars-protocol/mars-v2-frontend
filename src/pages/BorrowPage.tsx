import Borrowings from 'components/borrow/Borrowings'
import BorrowIntro from 'components/borrow/BorrowIntro'

export default function BorrowPage() {
  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <BorrowIntro />
      <Borrowings />
    </div>
  )
}
