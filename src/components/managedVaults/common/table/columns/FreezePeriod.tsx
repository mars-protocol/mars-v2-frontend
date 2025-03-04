import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import moment from 'moment'
import { formatLockupPeriod } from 'utils/formatters'

export const FREEZE_PERIOD_META = {
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

  const duration = moment.duration(value, 'seconds')
  const days = duration.as('days')

  // TODO: temporary UI for freeze period in minutes
  if (days < 1) {
    const minutes = duration.as('minutes')
    return <Text size='xs'>{formatLockupPeriod(minutes, 'minutes')}</Text>
  }

  return <Text size='xs'>{formatLockupPeriod(days, 'days')}</Text>
}
