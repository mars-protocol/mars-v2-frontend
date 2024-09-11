import Borrowings from '../components/borrow/Borrowings'
import BorrowIntro from '../components/borrow/BorrowIntro'

export default function BorrowPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <BorrowIntro />
      <Borrowings />
    </div>
  )
}
