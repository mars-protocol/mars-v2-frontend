import { Helmet } from 'react-helmet'

import { AvailableBorrowings } from 'components/Borrow/Borrowings'
import { ActiveBorrowings } from 'components/Borrow/Borrowings'

export default function BorrowPage() {
  return (
    <div className='flex w-full flex-col gap-4'>
      <ActiveBorrowings />
      <AvailableBorrowings />
    </div>
  )
}
