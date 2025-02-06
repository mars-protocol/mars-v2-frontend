import Button from 'components/common/Button'
import Loading from 'components/common/Loading'
import { Plus } from 'components/common/Icons'

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  header: '',
  enableSorting: false,
  meta: { className: 'w-40' },
}

interface Props {
  isLoading: boolean
}

export default function Deposit(props: Props) {
  const { isLoading } = props

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <Button onClick={() => {}} color='tertiary' text='Deposit' leftIcon={<Plus />} />
    </div>
  )
}
