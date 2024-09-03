import Button from 'components/common/Button'
import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  header: '',
  enableSorting: false,
  meta: { className: 'min-w-20' },
}

interface Props {
  isLoading: boolean
  value: string
}

export default function Deposit(props: Props) {
  const { value } = props

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton onClick={() => {}} color='tertiary' text='Deposit' leftIcon={<Plus />} short />
    </div>
  )
}
