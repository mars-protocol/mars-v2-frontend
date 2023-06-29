import { AvailableBorrowings } from 'components/Borrow/Borrowings'
import { ActiveBorrowings } from 'components/Borrow/Borrowings'

export default function BorrowPage() {
  return (
    <>
      <ActiveBorrowings />
      <AvailableBorrowings />
    </>
  )
}
