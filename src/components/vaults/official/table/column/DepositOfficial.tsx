import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  header: '',
  enableSorting: false,
  meta: { className: 'w-40' },
}

interface Props {
  isLoading: boolean
}

export default function DepositOfficial(props: Props) {
  const { isLoading } = props

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton onClick={() => {}} color='tertiary' text='Deposit' leftIcon={<Plus />} short />
    </div>
  )
}
