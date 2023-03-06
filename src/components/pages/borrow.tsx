import Borrowings from 'components/Borrow/Borrowings'

interface Props {
  params: PageParams
}

export default function BorrowPage(props: Props) {
  return (
    <div className='flex w-full flex-col'>
      <Borrowings params={props.params} type='active' />
      <Borrowings params={props.params} type='available' />
    </div>
  )
}
