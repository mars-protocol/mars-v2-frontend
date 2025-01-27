import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import moment from 'moment'
import { formatLockupPeriod } from 'utils/formatters'

export const FREEZE_PERIOD_META = {
  accessorKey: 'freeze_period',
  header: 'Freeze Period',
  meta: { className: 'w-30' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function FreezePeriod(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <Text size='xs'>
      {formatLockupPeriod(moment.duration(value, 'seconds').as('days'), 'days')}
    </Text>
  )
}
