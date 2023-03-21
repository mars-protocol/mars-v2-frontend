import { AvailableBorrowings } from 'components/Borrow/Borrowings'
import { ActiveBorrowings } from 'components/Borrow/Borrowings'

interface Props {
  params: PageParams
}

export default function BorrowPage(props: Props) {
  return (
    <div className='flex w-full flex-col gap-4'>
      <ActiveBorrowings params={props.params} />
      <AvailableBorrowings params={props.params} />
    </div>
  )
}
