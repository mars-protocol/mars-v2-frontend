import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const TIMESTAMP_META = {
  accessorKey: 'unfreezes',
  id: 'name',
  header: 'Unfreezes',
  meta: { className: 'min-w-30' },
}

interface Props {
  // TODO: update once we know data structure
  value: any
  isLoading: boolean
}

export default function Timestamp(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center'>
      <TitleAndSubCell
        className='ml-2 mr-2 text-left'
        title={value.unfreeze_date}
        sub={value.unfreeze_time}
      />
    </div>
  )
}
